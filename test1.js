try {
	var Bleacon = require("bleacon");
  var fs = require('fs');
  var path = require('path');
  var filePath = path.resolve(__dirname, "status.json");
  var logPath = path.resolve(__dirname, "log.txt");

	// 有効期限[sec]
	var intervalSec = 5;

  // この時間を超えると退出済み
	var intervalMillSec = 1000 * intervalSec;

//  writeLog('filePath:' + filePath);

	var writeLog = function(msg, tag) {
		msg = tag ? tag + msg : msg
		console.log(msg);
	}

	var dateToStr24H = function(date) {
		format = 'Y-M-D h:m:s';
    format = format.replace(/Y/g, date.getFullYear());
    format = format.replace(/M/g, ("0" + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/D/g, ("0" + date.getDate()).slice(-2));
    format = format.replace(/h/g, ("0" + date.getHours()).slice(-2));
    format = format.replace(/m/g, ("0" + date.getMinutes()).slice(-2));
    format = format.replace(/s/g, ("0" + date.getSeconds()).slice(-2));
    return format;
	}


	// watch status
	var watchStatus = function() {
  	if (!fs.existsSync(filePath)) {
			return;
		}
  	var json = {};
		try {
  		json = require(filePath);
		} catch (e) {
//			writeLog(e, 'error');
			return;
		}
//		writeLog('\nwatch:\n');
//		writeLog(json);
	}
	setInterval(watchStatus, 1000);

	// Update status
	var updateStatus = function() {
    	if (!fs.existsSync(filePath)) {
				return;
			}

			var dt = new Date();
			var ts = dt.getTime();
			var dtStr = dateToStr24H(dt);

//	    writeLog(dateToStr24H(new Date(), 'Y年M月D日 h:m:s'));
//			writeLog(uuid + major + minor);

    	var json = {};
			try {
    		json = require(filePath);
			} catch (e) {
				return;
			}
    	if (!json.tags) {
				return;
			}
    	for (var idx in json.tags) {
				var tag = json.tags[idx];

				var tmp_dt1 = new Date(tag.ts + intervalMillSec);
				var tmp_dt2 = new Date(ts);

//				writeLog('tag.ts:' + tag.ts);
//				writeLog('intervalMillSec:' + intervalMillSec);
//				writeLog('ts:' + ts);
//				writeLog('date1:' + dateToStr24H(tmp_dt1));
//				writeLog('date2:' + dateToStr24H(tmp_dt2));

				if ((tag.ts + intervalMillSec) < ts) {
    	    tag.exist = false;
//					writeLog('timeout: id=' + tag.id);
				} else {
//					writeLog('alive: id=' + tag.id);
				}
    	}

    	fs.writeFile(filePath, JSON.stringify(json), 'utf8', function() {
//				writeLog('Updated');
			});
	};
	setInterval(updateStatus, 1000);


	// Beacon watch
	var mamorioUUID = '<MAMORIO UUID here>';
  Bleacon.startScanning(mamorioUUID);
  Bleacon.on("discover", function(bleacon) {


console.log('ID=' + bleacon.uuid + ', position=' + bleacon.proximity);


		try {

    	var payload = bleacon;

    	var uuid = payload.uuid;
    	var major = payload.major;
    	var minor = payload.minor;
			var id = uuid + major + minor;
    	var pos = payload.proximity;
    	var exist = (pos == 'immediate' || pos == 'near');
    	var existUuid = false;
			var dt = new Date();
			var ts = dt.getTime();
			var dtStr = dateToStr24H(dt);

//	    writeLog(dateToStr24H(new Date(), 'Y年M月D日 h:m:s'));

//			writeLog(uuid + major + minor);

    	// ステータスの存在チェック
    	var json = {};
    	if (fs.existsSync(filePath)) {
				try {
    	  	json = require(filePath);
				} catch (e) {
					json = {};
				}
    	}

    	if (!json.tags) {
				json.tags = [];
			}
    	for (var idx in json.tags) {
				var tag = json.tags[idx];
    	  if (tag.id == id) {
//					writeLog('found same id: id=' + id + ', pos=' + pos);
					// 存在をチェックできたらON、OFFはupdate側のチェックを行う
					if (exist) {
						writeLog('found tag: id=' + id + ', pos=' + pos);
    	    	tag.exist = exist;
					}
    	    tag.ts = ts;
    	    tag.date = dtStr;
    	    existUuid = true;
    	  }
    	}
    	if (existUuid == false) {
//				writeLog('found new id: id=' + id);
				// 存在をチェックできたらON、OFFはupdate側のチェックを行う
    	  json.tags.push({
    	    id: id,
    	    exist: true,
    	    ts: ts,
					date: dtStr 
    	  });
//    	  json.tags.push({
//    	    id: id,
//    	    exist: true,
//    	    ts: ts,
//					date: dtStr 
//    	  });
				writeLog('new tag: id=' + id);
    	}

    	fs.writeFile(filePath, JSON.stringify(json), 'utf8', function() {
//				writeLog('writeDone');
			});

		} catch(err) {
    	fs.writeFile(logPath, err, 'utf8', function() {
//				writeLog('writeErrorDone');
			});
//		  writeLog(err)
		}
  });

} catch(err) {
//	writeLog(err)
}

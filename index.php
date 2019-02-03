<?php
  // この数以上になると風呂ON
  $tagCountLimit = 2;





	$tag = [];
	$tagCount = 0;

	try {
		$json = file_get_contents(dirname(__FILE__) . '/status.json');
		$json = json_decode($json, true);
		//var_dump($json);

		$tagCount = 0;
		foreach ($json['tags'] as $tag) {
//			var_dump($tag);
			if ($tag['exist']) {
				$tagCount += 1;
			}
		}
		$tag = $json['tags'][0];
//		var_dump($tagCount);
//		var_dump($tag);
	} catch (Exception $ex) {
		var_dump($ex);
	}
//  var_dump('tagCount:' + $tagCount);
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title></title>
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="">
<script src="./jquery-3.3.1.js"></script>
<link rel="shortcut icon" href="">
<style>
  .furo_Img {
    max-height: 200px;
  }
  .furo_Img[aria-hidden="true"] {
		display: none;
  }
</style>
</head>
<body>

<div class="furo_Msg">
  <p>只今の利用者数: <span class="furo_Msg-Num"><?php echo $tagCount; ?></span>人</p>
</div>

<div class="furo_Block">
<?php if ($tagCountLimit <= $tagCount) { ?>
	<img src="./ok_man.png" alt="ok" class="furo_Img furo_Img-on">
	<img src="./ng_man.png" alt="ng" class="furo_Img furo_Img-ng" aria-hidden="true">
<?php } else { ?>
	<img src="./ok_man.png" alt="ok" class="furo_Img furo_Img-on" aria-hidden="true">
	<img src="./ng_man.png" alt="ng" class="furo_Img furo_Img-ng">
<?php } ?>
</div>

<script>
$(function(){
  // この数以上になったら、入っているマーク
  var furoLimit = <?php echo $tagCountLimit; ?>;

  var updateStatus = function(statusJson){
    if (!statusJson && !statusJson.tags) {
      console.log('error');
    }

		var tags = statusJson.tags;
    var tagCount = 0;
    for (var idx in tags) {
      var tag = tags[idx];
      if (tag.exist) {
        tagCount++;
      }
    }

    var jam = (furoLimit <= tagCount);
    if (jam) {
      $('.furo_Img-ng').attr('aria-hidden', false);
      $('.furo_Img-on').attr('aria-hidden', true);
    } else {
      $('.furo_Img-on').attr('aria-hidden', false);
      $('.furo_Img-ng').attr('aria-hidden', true);
    }

    $('.furo_Msg-Num').text(tagCount);
  };



	var updateStatusRequest = function(){
  	$.ajax({
  	  url:'./status.json',
  	  type:'GET'
		})
  	// Ajaxリクエストが成功した時発動
  	.done( (data) => {
  		console.log('get status success');
  	  console.log(data);
			updateStatus(data);
  	})
  	// Ajaxリクエストが失敗した時発動
  	.fail( (data) => {
  		$('.result').html(data);
  	  	console.log('get status fail');
  	    console.log(data);
  	  })
//		// Ajaxリクエストが成功・失敗どちらでも発動
//  	.always( (data) => {
//  		console.log('get status always');
//  	  console.log(data);
//  	});
	};
  setInterval(updateStatusRequest, 2000);

});
</script>
</body>
</html>

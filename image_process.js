var img;

Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for(var i = 0, len = this.length; i < len; i++) {
    if(this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
  }
}

var submit = function() {
  var code_preview = document.getElementById('code_preview');
  var algo_code = code_preview.value;

  var code_runner = document.getElementById('code_runner'); 

  if (code_runner) {
    code_runner.remove();
  }

  code_runner = document.createElement('script');
  code_runner.id = 'code_runner';
  var code = document.createTextNode(algo_code);
  code_runner.appendChild(code);

  document.body.insertBefore(code_runner, code_preview);
}

var run_algo = function(algo_fn) {
  img = document.getElementById("original");

  var c = document.getElementById("myCanvas");
  c.width = img.width;
  c.height = img.height;

  var ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);

  var imgData = ctx.getImageData(0, 0, img.width, img.height);

  imgData = algo_fn(imgData);

  ctx.putImageData(imgData,0,0);
};


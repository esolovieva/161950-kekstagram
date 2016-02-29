'use strict';

(function() {
  /**
   * @constructor
   * @param {string} data
   */
  var Photo = function(data) {
    this._data = data;
    this._onPicClick = this._onPicClick.bind(this);
  };
  Photo.prototype.onClickCallback = null;
  Photo.prototype.render = function() {
    var NEW_IMAGE_WIDTH = 182;
    var NEW_IMAGE_HEIGHT = 182;
    var template = document.querySelector('#picture-template');
    if ('content' in template) {
      this.element = template.content.children[0].cloneNode(true);
    } else {
      this.element = template.children[0].cloneNode(true);
    }
    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;
    var picImage = new Image();
    var imageLoadTimeout;
    //Проверка, что изображение загрузилось с сервера
    picImage.onload = function() {
      clearTimeout(imageLoadTimeout);
      var newImg = document.createElement('img');
      newImg.src = this._data.url;
      newImg.setAttribute('width', NEW_IMAGE_WIDTH);
      newImg.setAttribute('height', NEW_IMAGE_HEIGHT);
      var existingIMG = this.element.querySelector('img');
      var parentNode = existingIMG.parentNode;
      parentNode.replaceChild(newImg, existingIMG);
    }.bind(this);
    //Если изображение не загрузилось
    picImage.onerror = function() {
      this.element.classList.add('picture-load-failure');
    }.bind(this);
    picImage.src = this._data.url;
    //Если сервер не отвечает по таймауту
    var IMAGE_TIMEOUT = 10000;
    imageLoadTimeout = setTimeout(function() {
      picImage.src = ''; //Прекращаем загрузку
      this.element.classList.add('picture-load-failure'); // Показываем ошибку
    }, IMAGE_TIMEOUT);
    this.element.addEventListener('click', this._onPicClick);
  };
  Photo.prototype.remove = function() {
    this.element.removeEventListener()('click', this._onPicClick);
  };
  Photo.prototype._onPicClick = function(evt) {
    console.dir(evt.target);
    if (!this.element.classList.contains('picture-load-failure')) {
      if (this.onClickCallback !== null && typeof this.onClickCallback === 'function') {
        this.onClickCallback();
      }
    }
  };
  window.Photo = Photo;
})();

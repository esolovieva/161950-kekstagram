'use strict';

define(function() {
  /**
   * @constructor
   */
  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    this._onHashChange = this._onHashChange.bind(this);
    this._currentPictureId = 0;
    window.addEventListener('hashchange', this._onHashChange);
  };
  /**
   * Показывает и прячет галерею на определенной фотографии
   * в зависимости от содержимого хэша
   * @private
     */
  Gallery.prototype._onHashChange = function() {
    var currentHash = location.hash;
    var found = currentHash.match(/#photo\/(\S+)/);
    if (found !== null) {
      this.show();
    } else {
      this.hide();
    }
  };
  /**
   *Показывает галерею
   */
  Gallery.prototype.show = function() {
    if (typeof this.element !== 'undefined') {
      if (this.element.classList.contains('invisible')) {
        this.element.classList.remove('invisible');
        this.element.addEventListener('click', this._onPhotoClick);
        window.addEventListener('keydown', this._onDocumentKeyDown);
      } else {
        this.setCurrentPicture(location.hash.slice(7));
      }
    }
  };
  /**
   *Прячет галерею
   */
  Gallery.prototype.hide = function() {
    if (typeof this.element !== 'undefined') {
      this.element.classList.add('invisible');
      history.pushState(null, null, location.origin + location.pathname);
      this.element.removeEventListener('click', this._onPhotoClick);
      window.removeEventListener('keydown', this._onDocumentKeyDown);
    }
  };
  /**
   * Показывает следующую по порядку фотографию,
   * если она есть.
   * @private
   */
  Gallery.prototype._onPhotoClick = function() {
    var nextPictureId;
    var pictureUrl;
    if (typeof this._currentPictureId !== 'undefined') {
      nextPictureId = ++this._currentPictureId;
      if (nextPictureId < this._data.length) {
        pictureUrl = this._data[nextPictureId].url;
        location.hash = 'photo/' + pictureUrl;
      }
    }
  };
  /**
   * Прячет фотогалерею при нажатии клавиши Escape
   * @param {Event} evt
   * @private
     */
  Gallery.prototype._onDocumentKeyDown = function(evt) {
    evt.preventDefault();
    if (evt.keyCode === 27) {
      this.hide();
    }
  };
   /**
   * Сохраняет массив фотографий в объекте
   * @param {Array.<Object>} data - Массив фотографий из json
    */
  Gallery.prototype.setPictures = function(data) {
    this._data = data;
  };
  /**
   * Берет фотографию с переданным индексом и отрисовывает ее в галерее,
   * обновляя DOM-элемент
   * @param {*} id - Индекс фотографии в массиве фотографий,
   * если параметр -  число или путь к фотографии, если параметр - строка
   */
  Gallery.prototype.setCurrentPicture = function(id) {
    var picture;
    if (typeof id === 'number') {
      this._currentPictureId = id;
      picture = this._data[id];
    }
    if (typeof id === 'string') {
      var i, entry;
      for (i = 0; i < this._data.length; i++) {
        entry = this._data[i];
        if (entry.url === id) {
          picture = entry;
          this._currentPictureId = i;
          break;
        }
      }
    }
    var overlayImage = this.element.querySelector('.gallery-overlay-image');
    var overlayControlsLike = this.element.querySelector('.gallery-overlay-controls-like .likes-count');
    var overlayControlsComment = this.element.querySelector('.gallery-overlay-controls-comments .comments-count');
    overlayImage.src = picture.url;
    overlayControlsLike.textContent = picture.likes;
    overlayControlsComment.textContent = picture.comments;
  };
  return Gallery;
});

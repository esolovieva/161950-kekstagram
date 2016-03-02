'use strict';

define(function() {
  /**
   * @constructor
   */
  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    this._currentPictureId = 0;
  };
  /**
   *Показывает галерею
   */
  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');
    this.element.addEventListener('click', this._onPhotoClick);
    window.addEventListener('keydown', this._onDocumentKeyDown);
  };
  /**
   *Прячет галерею
   */
  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this.element.removeEventListener('click', this._onPhotoClick);
    window.removeEventListener('keydown', this._onDocumentKeyDown);
  };
  /**
   * Показывает следующую по порядку фотографию,
   * если она есть.
   * @private
   */
  Gallery.prototype._onPhotoClick = function() {
    var nextPictureId;
    if (this._currentPictureId) {
      nextPictureId = ++this._currentPictureId;
      if (nextPictureId < this._data.length) {
        this.setCurrentPicture(nextPictureId);
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
   * @param {number} number - Индекс фотографии в массиве фотографий
     */
  Gallery.prototype.setCurrentPicture = function(number) {
    this._currentPictureId = number;
    var picture = this._data[number];
    var overlayImage = this.element.querySelector('.gallery-overlay-image');
    var overlayControlsLike = this.element.querySelector('.gallery-overlay-controls-like .likes-count');
    var overlayControlsComment = this.element.querySelector('.gallery-overlay-controls-comments .comments-count');
    overlayImage.src = picture.url;
    overlayControlsLike.textContent = picture.likes;
    overlayControlsComment.textContent = picture.comments;
  };
  return Gallery;
});

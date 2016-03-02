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
   *Показ галереи
   */
  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');
    this.element.addEventListener('click', this._onPhotoClick);
    window.addEventListener('keydown', this._onDocumentKeyDown);
  };
  /**
   *Прячем галерею
   */
  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this.element.removeEventListener('click', this._onPhotoClick);
    window.removeEventListener('keydown', this._onDocumentKeyDown);
  };
  /**
   * Допишите обработчик клика по фотографии _onPhotoClick, созданный в прошлом разделе так,
   * чтобы он показывал с помощью метода setCurrentPicture следующую по порядку фотографию,
   * если она есть.
   * @param evt
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
  Gallery.prototype._onDocumentKeyDown = function(evt) {
    evt.preventDefault();
    if (evt.keyCode === 27) {
      this.hide();
    }
  };
  /**
   * Добавьте метод setPictures(Array.<Object>), который принимает на вход
   * массив фотографий из json и сохраняет его в объекте.
   * @param data
     */
  Gallery.prototype.setPictures = function(data) {
    this._data = data;
  };
  /**
   * Добавьте метод setCurrentPicture(number), который берет фотографию с
   * переданным индексом из массива фотографий и отрисовывает показывает
   * ее в галерее, обновляя DOM-элемент .gallery-overlay: меняет src у фотографии
   * .gallery-overlay-image и выставляет правильные количества лайков и комментариев
   * в элементы .gallery-overlay-controls-like и .gallery-overlay-controls-comments.
   * @param number
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

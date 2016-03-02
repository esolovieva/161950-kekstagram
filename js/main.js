'use strict';

define([
  'upload',
  'pictures'
],
function(upload, pictures) {
  upload.setFormValuesFromResizer();
  pictures.getPictures();
}
);

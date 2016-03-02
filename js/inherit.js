'use strict';

define(function() {
  /**
   * Записывает в прототип дочернего
   * конструктора child методы и свойства родительского конструктора parent
   * через пустой конструктор
   * @param {function} child
   * @param {function} parent
   */
  function inherit(child, parent) {
    var EmptyCtor = function() {};
    EmptyCtor.prototype = parent.prototype;
    child.prototype = new EmptyCtor();
  }
  return inherit;
});


import { initMenu } from './modules/menu.js';
import { initFilters } from './modules/filters.js';
import { appState } from './modules/state.js';

window.appState = appState; 

$(document).ready(function() {
  initMenu();
  initFilters();
  
  $(document).on('click', '#menu_btn_desktop, #menu_btn_mobile', function(e) {
    e.stopPropagation();
    toggleMenu(); 
  });

  $('.shop-grid').css('transition', 'margin-top 0.3s ease');
  
  $('body, .gecco').css('background-color', '#F7F5F3');
  $(".shop-menu").css(
    'background-image', 
    'linear-gradient(to bottom, #F7F5F3, rgba(147, 112, 231, 0))'
  );
});

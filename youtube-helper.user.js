// ==UserScript==
// @name         Youtube Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Youtube helper
// @author       Arthur
// @include      /www.youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    hideYoutubeCEElement();

    function hideYoutubeCEElement() {
        /**
         * .ytp-ce-element might be ytp-ce-video, ytp-ce-playlist, ytp-ce-website, ytp-ce-channel and so on
         */
        addGlobalStyle(`
          .ytp-ce-element {
            display: none !important;
          }
        `);
    }

    function addGlobalStyle(css) {
        const style = document.createElement('style');
        style.id = 'tampermonkey-youtube-plus';
        style.type = 'text/css';
        style.innerHTML = css;
        document.head.appendChild(style);
    }
})();

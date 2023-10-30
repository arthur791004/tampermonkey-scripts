// ==UserScript==
// @name         Youtube Helper
// @namespace    http://tampermonkey.net/
// @version      0.2.2
// @description  Youtube helper
// @author       Arthur
// @include      /www.youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const ELEMENTS = {
        MAIN_PLAYER: 'ytd-player video.html5-main-video',
        CONFIRM_DIALOG_CONTINUE_BUTTON: 'yt-confirm-dialog-renderer .yt-spec-button-shape-next--call-to-action',
        SKIP_AD_BUTTON: 'ytp-ad-skip-button',
    };

    hideYoutubeCEElement();
    enableAutoContinueIfThePlayerPausedByConfirmDialog();
    registerSkipAdShortcut();

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

    function enableAutoContinueIfThePlayerPausedByConfirmDialog() {
        window.setTimeout(() => {
            const mainPlayer = document.querySelector(ELEMENTS.MAIN_PLAYER);
            if (!mainPlayer) {
                enableAutoContinueIfThePlayerPausedByConfirmDialog();
                return;
            }
            mainPlayer.addEventListener('pause', () => {
                const continueButton = document.querySelector(ELEMENTS.CONFIRM_DIALOG_CONTINUE_BUTTON);
                if (continueButton) {
                    mainPlayer.play();
                }
            });
        }, 30 * 1000);
    }

    function registerSkipAdShortcut() {
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 's') {
                skipAd();
            }
        });
    }

    function skipAd() {
        const adPlayer = document.querySelector('video');
        adPlayer.currentTime = adPlayer.duration;
        window.setTimeout(() => {
            const skipAdButton = document.querySelector(ELEMENTS.SKIP_AD_BUTTON);
            if ( skipAdButton ) {
                skipAdButton.click();
            }
        });
    }

    function addGlobalStyle(css) {
        const style = document.createElement('style');
        style.id = 'tampermonkey-youtube-plus';
        style.type = 'text/css';
        style.innerHTML = css;
        document.head.appendChild(style);
    }
})();

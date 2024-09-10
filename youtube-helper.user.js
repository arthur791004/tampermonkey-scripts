// ==UserScript==
// @name         Youtube Helper
// @namespace    http://tampermonkey.net/
// @version      0.2.4
// @description  Youtube helper
// @author       Arthur
// @include      /www.youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const ELEMENTS = {
        MAIN_PLAYER: 'ytd-player video.html5-main-video',
        MAIN_PLAYER_RIGHT_CONTROLS: 'div.ytp-right-controls',
        CONFIRM_DIALOG_CONTINUE_BUTTON: 'yt-confirm-dialog-renderer .yt-spec-button-shape-next--call-to-action',
        SKIP_AD_BUTTON: 'button[class^=ytp-ad-skip-button]',
    };

    createPolicy();
    hideYoutubeCEElement();
    enableAutoContinueIfThePlayerPausedByConfirmDialog();
    enableAutoSkipAd();
    renderCustomSkipAdButton();
    registerSkipAdShortcut();

    function createPolicy() {
         window.trustedTypes.createPolicy('default', {
             createHTML: string => string
             // Optional, only needed for script (url) tags
             ,createScriptURL: string => string
             ,createScript: string => string,
         });
    }

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

    function getMainPlayer(times = 0) {
        return new Promise((resolve) => {
            const mainPlayer = document.querySelector(ELEMENTS.MAIN_PLAYER);
            if (mainPlayer) {
                return resolve(mainPlayer);
            }

            // Retry if we cannot get the player when the script is loaded.
            window.setTimeout(() => {
                return getMainPlayer(times + 1).then(resolve);
            }, 100 * times);
        });
    }

    async function enableAutoContinueIfThePlayerPausedByConfirmDialog() {
        const mainPlayer = await getMainPlayer();
        mainPlayer.addEventListener('pause', () => {
            const continueButton = document.querySelector(ELEMENTS.CONFIRM_DIALOG_CONTINUE_BUTTON);
            if (continueButton) {
                mainPlayer.play();
            }
        });
    }

    async function enableAutoSkipAd() {
        const mainPlayer = await getMainPlayer();

        skipAdIfPlaying();
        mainPlayer.addEventListener('play', () => {
            skipAdIfPlaying();
        });
    }

    function renderCustomSkipAdButton() {
        const mainPlayerRightCtrls = document.querySelector(ELEMENTS.MAIN_PLAYER_RIGHT_CONTROLS);
        if (!mainPlayerRightCtrls) {
            window.setTimeout(()=> renderCustomSkipAdButton(), 1000);
            return;
        }

        const customSkipAdButton = document.createElement('button');
        customSkipAdButton.attritubes
        customSkipAdButton.classList.add('ytp-button');
        customSkipAdButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="512" height="441" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 440.64" style="height:100%;width:100%;stroke:#fff;fill: #fff;transform: scale(0.7);">
            <path fill-rule="nonzero" d="M175.62 399.21c9.75 2.44 15.69 12.33 13.25 22.08-2.44 9.76-12.33 15.69-22.08 13.25-59.06-14.88-106.52-52.3-135.48-100.77C2.34 285.3-8.14 225.8 6.72 166.78c14.87-59.06 52.3-106.5 100.77-135.47S215.46-8.14 274.48 6.72c20.6 5.19 39.82 13.14 57.33 23.35a219.44 219.44 0 0 1 47.18 36.99l.14-11.58c.13-10.04 8.38-18.07 18.41-17.94 10.03.13 18.06 8.38 17.94 18.4l-.71 58.06c-.02 1.86-.33 3.65-.87 5.33-1.66 9.08-9.99 15.59-19.38 14.8l-57.87-4.65c-10.01-.84-17.43-9.63-16.59-19.63.84-10 9.63-17.42 19.62-16.58l15.28 1.23c-.33-.3-.66-.62-.97-.95-11.78-12.38-25.35-23.21-40.42-31.99-14.61-8.52-30.68-15.17-47.92-19.51-49.36-12.43-99.06-3.7-139.5 20.47-40.44 24.17-71.68 63.78-84.1 113.1-12.43 49.35-3.7 99.06 20.47 139.49 24.17 40.44 63.79 71.68 113.1 84.1zM123.11 288.7l5.32-29.31c11.64 2.91 22.13 4.37 31.43 4.37 9.31 0 16.81-.38 22.51-1.14v-11.53l-17.1-1.52c-15.44-1.39-26.05-5.1-31.81-11.11-5.76-6.01-8.64-14.91-8.64-26.69 0-16.21 3.51-27.34 10.54-33.42 7.02-6.08 18.96-9.12 35.8-9.12 16.85 0 32.03 1.58 45.59 4.75L212 202.33c-11.78-1.9-21.21-2.84-28.3-2.84-7.1 0-13.11.31-18.05.94v11.34l13.68 1.33c16.58 1.65 28.05 5.61 34.38 11.87 6.33 6.27 9.5 14.98 9.5 26.12 0 7.98-1.08 14.72-3.24 20.23-2.15 5.51-4.71 9.69-7.68 12.54-2.99 2.84-7.2 5.03-12.64 6.55-5.44 1.52-10.22 2.43-14.34 2.75-4.11.32-9.59.48-16.43.48-16.46 0-31.72-1.65-45.77-4.94zm153.75-49.57v51.66h-37.99V172.08h37.99v48.43c1.71 0 19.22-44.1 21.27-48.43h41.03l-28.49 58.31 29.44 60.4h-41.03l-21.46-51.66h-.76zm76.07 51.66V172.08h37.98v118.71h-37.98zm121.08-28.69h-26.73v28.69h-35.95V172.08h59.83c27.22 0 40.84 14.62 40.84 43.87 0 16.08-3.55 27.99-10.64 35.71-2.66 2.91-6.34 5.38-11.02 7.41-4.68 2.02-10.13 3.03-16.33 3.03zm-26.73-61.67v33.32h10.78c4.55 0 7.88-.48 9.97-1.42 2.08-.95 3.13-3.14 3.13-6.56v-17.36c0-3.42-1.06-5.61-3.13-6.55-2.09-.94-5.43-1.43-9.97-1.43h-10.78zm-209 203.82c-18.71 1.5-23.29 28.46-4.04 35.46 2.66.81 4.7 1.08 7.52.85 12.97-1.16 26.57-3.61 39.08-7.21 20.42-5.96 16.15-36.68-6.37-35.74-1.23.11-2.46.31-3.63.66-8.66 3.03-23.3 5.15-32.56 5.98zm91.77-35c-6.7 5.02-9.03 13.68-6 21.43 4.52 11.06 18.25 14.97 27.83 7.78 10.62-7.8 20.59-16.91 29.58-26.53 2.87-3.05 4.65-7.3 4.83-11.45.74-17.07-19.88-25.75-31.6-13.34-7.26 7.94-15.98 15.74-24.64 22.11z"></path>
          </svg>`;
        customSkipAdButton.addEventListener('click', () => skipAd());
        mainPlayerRightCtrls.prepend(customSkipAdButton);
    }

    function registerSkipAdShortcut() {
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 's') {
                skipAd();
            }
        });
    }

    function isPlayingAd() {
        return document.querySelector('.ad-interrupting') || document.querySelector('.ad-showing');
    }

    function skipAdIfPlaying() {
        if (!isPlayingAd()) {
            return;
        }

        skipAd();
    }

    function skipAd() {
        const adPlayer = document.querySelector('video');
        try {
            adPlayer.currentTime = Math.ceil(adPlayer.duration);
        } catch (e) {
            // Retry if we cannot get the duration correctly.
            window.setTimeout(() => skipAd(), 1000);
            return;
        }
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

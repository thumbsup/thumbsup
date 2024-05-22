//Taken from https://github.com/ccvca/js-multi-file-download/blob/bcafa4a947ec19286c217231b6383a0e6bea44fc/HtmlJsExample/downloadImages.js

import { DownloadFiles, FileState } from './multi-file-download/multi-file-download.js'

// Download images and show result in a div
export async function downloadImages(imageList, statusDiv, overrideExistingFile) {
    const dirPickOpts = {
        mode: 'readwrite',
        //startIn: 'pictures'
    };
    const dirHandle = await window.showDirectoryPicker(dirPickOpts);

    // Setup HTML Status display 
    let dlFiles = {};
    const summary = document.createElement('div');
    summary.classList.add('summary');
    statusDiv.replaceChildren(summary); // Clear all (old) childs

    const updateSummary = () => {
        const imgCnt = Object.keys(dlFiles).reduce(
            (accumulator, url) => dlFiles[url]?.state !== FileState.STARTED ? accumulator + 1 : accumulator
            , 0
        );
        summary.innerHTML = `${imgCnt} / ${imageList.length}`;
    };
    updateSummary();
    
    // Callback with download progress
    const onStateUpdate = (url, state) => {
        let element;
        if (url in dlFiles) {
            element = dlFiles[url];
            element = { ...element, ...state };
        }
        else if (state.state !== undefined) {
            element = { state: state.state, ...state };
            element.htmlEl = document.createElement('div');
            element.htmlEl.classList.add('progress')
            statusDiv.appendChild(element.htmlEl);
        } else {
            console.error('Stored DlFilesState broken.');
            return;
        }
        
        let text = `${url}`;
        if (element.state != FileState.STARTED) {
            text += ` ${FileState[element.state]}`
        }
        if (state.progress?.percent !== undefined) {
            text += ` ${+state.progress?.percent.toFixed(1)} %`;
        }

        if (state.error) {
            element.htmlEl.classList.add('error');
            console.error(state.error);
            text += ` ${state.error.message}`
        }
        element.htmlEl.innerHTML = text;

        if (element.state === FileState.COMPLETED_DOWNLOAD || element.state === FileState.SKIPPED_EXIST){
            statusDiv.removeChild(element.htmlEl);
        }
        dlFiles = { ...dlFiles, [url]: element };
        updateSummary();
    };

    await DownloadFiles(dirHandle, imageList, {
        onStateUpdate: onStateUpdate,
        overrideExistingFile: overrideExistingFile
    });

    // Return final state
    return dlFiles;
};

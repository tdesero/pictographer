import store from './store';

let copiedPath;

const shortcuts = function() {
    document.addEventListener('keydown', function(event) {

        /* undo */
        if (event.ctrlKey && event.key === 'z') {
            if (store.debug) console.log('shortcut undo')
            store.setHistoryPos(+1);
            store.historyGoTo(store.state.historyPos);
        }

        /* redo */
        if (event.ctrlKey && event.key === 'y') {
            if (store.debug) console.log('shortcut undo')
            store.setHistoryPos(-1);
            store.historyGoTo(store.state.historyPos);
        }

        /* IMPORTANT: the following shortcuts should only be possible if they are not comming from an input field */
        if (event.target.matches('input')) return

        /* tool shortcuts */
        if (event.key === 'e') {
            store.state.tool = "EDIT";
        }
        if (event.key === 's') {
            store.state.tool = "SELECT";
        }
        if (event.key === 'p') {
            store.state.tool = "PEN";
        }

        if (event.key === '-') {
          if (store.state.tool === "EDIT" || store.state.tool === "PEN") {
              store.deleteSegment();
          }
        }

        /* delete shortcuts */
        if (event.key === 'Delete' || event.key === 'Backspace') {
            if (store.state.tool === "EDIT" || store.state.tool === "PEN") {
                store.splitPath(undefined, undefined, false);
            }
            if (store.state.tool === "SELECT") {
                store.deletePath();
            }
        }

        /* copy path */ 
        if (event.ctrlKey && event.key === 'c') {
          copiedPath = store.copyPath();
        }
        if (event.ctrlKey && event.key === 'v' && copiedPath) {
          store.pastePath(copiedPath);
        }

        /* move path with arrow keys */ 
        if (store.state.tool === 'SELECT') {
          switch (event.key) {
            case "ArrowLeft":
                store.movePathByPx(store.getPath(), -1, 0);
                store.updateBBox();
                store.historySnapshot();
                break;
            case "ArrowRight":
              store.movePathByPx(store.getPath(), 1, 0);
              store.updateBBox();
              store.historySnapshot();
                break;
            case "ArrowUp":
                store.movePathByPx(store.getPath(), 0, -1);
                store.updateBBox();
                store.historySnapshot();
                break;
            case "ArrowDown":
                store.movePathByPx(store.getPath(), 0, 1);
                store.updateBBox();
                store.historySnapshot();
                break;
          }
        }

    })
}

export default shortcuts;
import store from './store';

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

        /* delete shortcuts */
        if (event.key === 'Delete' || event.key === 'Backspace') {
            if (store.state.tool === "EDIT" || store.state.tool === "PEN") {
                store.deleteSegment();
            }
            if (store.state.tool === "SELECT") {
                store.deletePath();
            }
        }

    })
}

export default shortcuts;
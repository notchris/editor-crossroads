import { clamp, html } from './deps.js'
import buildCells      from './build-layer-cells.js'
import constants       from './constants.js'


function init (options={}) {
    return { }
}


function view (model, update) {
    const { commandStack } = model.grid

    const _undo = function () {
        commandStack.redo.push(commandStack.commands.pop())
        buildCells(model.grid)
        update()
    }

    const _redo = function () {
        commandStack.commands.push(commandStack.redo.pop())
        buildCells(model.grid)
        update()
    }

    return html`<div class="command-bar">
        <div>
            <button class="editor-button"
                    @on:click=${() => { model.grid.activeCommand = 'drawTile'; update(); }}
                    @class:button-selected=${model.grid.activeCommand === 'drawTile'}>draw</button>
            <button class="editor-button"
                    @on:click=${() => { model.grid.activeCommand = 'eraseTile'; update(); }}
                    @class:button-selected=${model.grid.activeCommand === 'eraseTile'}>erase</button>
        </div>

        <div>
            <button class="editor-button"
                    @on:click=${_undo}
                    @props:disabled=${commandStack.commands.length === 0}>undo</button>

            <button class="editor-button"
                    @on:click=${_redo}
                    @props:disabled=${commandStack.redo.length === 0}>redo</button>
        </div>
    </div>`
}


export default { init, view }

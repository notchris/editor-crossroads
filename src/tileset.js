import { html }  from './deps.js'
import constants from './constants.js'


function init (options={}) {
    return { }
}


function view (model, update) {
    const { level } = model.grid
    if (level.tileset.selectedTile < 1)
        return html`<div class="tileset">
            <img src="/assets/tileset1.png"/>
        </div>`

    const cell = level.selectedTile - 1

    const col = cell % level.tileset.cols
    const row = Math.floor(cell / level.tileset.cols)

    // account for the 1px of padding between each tile in the spritesheet
    const paddingX = col + level.tileset.padding
    const paddingY = row + level.tileset.padding

    const sx = col * constants.TILE_SIZE + paddingX
    const sy = row * constants.TILE_SIZE + paddingY

    const _selectTile = function (ev) {
        if (model.grid.activeCommand !== 'drawTile')
            return

        const tileSize = constants.TILE_SIZE + level.tileset.padding

        const col = Math.floor(ev.offsetX / tileSize)
        const row = Math.floor(ev.offsetY / tileSize)

        level.selectedTile = row * level.tileset.cols + col + 1

        update()
    }

    return html`<div class="tileset">
        <img src="/assets/tileset1.png" @on:click=${_selectTile}/>
        <div @class:selected-tile=${model.grid.activeCommand === 'drawTile'}
             @style:top=${sy + 'px'}
             @style:left=${sx + 'px'}
             @style:display=${level.tileset.selectedTile >= 0}></div>
    </div>`
}


export default { init, view }

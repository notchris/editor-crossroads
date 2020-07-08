import { html }  from './deps.js'
import constants from './constants.js'


function init (options={}) {
    return { }
}


function view (model, update) {
    const col = Math.floor(model.grid.hoverX / constants.TILE_SIZE)
    const row = Math.floor(model.grid.hoverY / constants.TILE_SIZE)
    return html`<div class="footer">
        <span>x: ${model.grid.hoverX}  y: ${model.grid.hoverY}</span>
        <span style="padding-left:30px;">col: ${col}  row: ${row}</span>
    </div>`
}


export default { init, view }

import { html }    from './deps.js'
import constants   from './constants.js'
import createArray from './create-array.js'


function init (options={}) {
    return { }
}


function view (model, update) {
    const { level } = model.grid

    const _selectLayer = function (layerIdx) {
        level.selectedLayer = layerIdx
        update()
    }

    const _updateLayerName = function (ev, layerIdx) {
        level.layers[layerIdx].name = ev.target.value
        update()
    }

    const layers = level.layers.map((l, idx) => {
        return html`<div class="property-field" style="position: relative;">
            <div class="property-label">
                <input type="text"
                       @on:click=${() => _selectLayer(idx)}
                       @on:change=${(ev) => _updateLayerName(ev, idx)}
                       @class:selected=${idx === level.selectedLayer}
                       @attrs:value=${l.name}>
                <button class="editor-button"
                        @on:click=${() => { l.visible = !l.visible; update(); }}
                        @class:button-selected=${l.visible}
                        title="visible: ${l.visible}"
                        style="width: 26px; position: absolute; right: 30px; bottom: 0px;"> V </button>
                <button class="editor-button"
                        @class:button-selected=${l.locked}
                        @on:click=${() => { l.locked = !l.locked; update(); }}
                        title="locked: ${l.locked}"
                        style="width: 26px; position: absolute; right: 0px; bottom: 0px;"> L </button>
            </div>        
        </div>`
    }).reverse()

    window.m = model

    const _addLayer = function () {
        level.layers.push({
            name: 'layer',
            type: 'tile',   // tile | object
            cells: createArray(level.cols * level.rows, 0),
            locked: false,
            visible: true
        })
        update()
    }
    

    return html`<div class="panel-content" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div class="layers">
            ${layers}
        </div>

        <div class="panel-footer" style="height: 32px;background-color: #303030; margin: -4px">
            <button class="editor-button"
                    @on:click=${_addLayer}
                    style="width: 26px;"> + </button>
            <button class="editor-button" style="width: 26px;"> ^ </button>
            <button class="editor-button" style="width: 26px;"> v </button>
            <button class="editor-button" style="width: 26px;"> - </button>
        </div>
    </div>`
}


export default { init, view }

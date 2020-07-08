import { clamp, html }     from './deps.js'
import constants    from './constants.js'
import createArray  from './create-array.js'
import randomUint32 from './random-uint32.js'


function init (options={}) {
    return { }
}


function view (model, update) {
    const { level } = model.grid
    window.m = model

    const _selectLayer = function (layerId) {
        level.selectedLayer = layerId
        update()
    }

    const _updateLayerName = function (ev, layerId) {
        level.layers[layerId].name = ev.target.value
        update()
    }

    const layers = level.layerOrder.map((layerId) => {
        const l = level.layers[layerId]

        return html`<div class="property-field" style="position: relative;">
            <div class="property-label">
                <input type="text"
                       @on:click=${() => _selectLayer(layerId)}
                       @on:keyup=${(ev) => _updateLayerName(ev, layerId)}
                       @class:selected=${layerId === level.selectedLayer}
                       @props:value=${l.name}>
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


    const _addLayer = function () {
        const uid = randomUint32()
        level.layerOrder.push(uid)

        level.layers[uid] = {
            name: 'layer',
            type: 'tile',   // tile | object
            cells: createArray(level.cols * level.rows, 0),
            locked: false,
            visible: true
        }

        update()
    }

    const _moveSelectedLayerUp = function () {
        const idx = model.grid.level.layerOrder.indexOf(model.grid.level.selectedLayer)

        // layer not found
        if (idx < 0)
            return

        // already at the top
        if (idx === model.grid.level.layerOrder.length-1)
            return

        const existingLayerId = model.grid.level.layerOrder[idx+1]

        model.grid.level.layerOrder[idx+1] = model.grid.level.selectedLayer
        model.grid.level.layerOrder[idx] = existingLayerId
        update()
    }

    const _moveSelectedLayerDown = function () {
        const idx = model.grid.level.layerOrder.indexOf(model.grid.level.selectedLayer)

        // layer not found
        if (idx < 0)
            return

        // already at the top
        if (idx === 0)
            return

        const existingLayerId = model.grid.level.layerOrder[idx-1]

        model.grid.level.layerOrder[idx-1] = model.grid.level.selectedLayer
        model.grid.level.layerOrder[idx] = existingLayerId

        update()
    }

    const _deleteSelectedLayer = function () {
        const idx = model.grid.level.layerOrder.indexOf(model.grid.level.selectedLayer)
        if (idx < 0)
            return

        model.grid.level.layerOrder.splice(idx, 1)
        model.grid.level.selectedLayer = clamp(model.grid.level.selectedLayer - 1, 0, model.grid.level.layerOrder.length)
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
            <button class="editor-button"
                    @on:click=${_moveSelectedLayerUp}
                    style="width: 26px;"> ^ </button>
            <button class="editor-button"
                    @on:click=${_moveSelectedLayerDown}
                    style="width: 26px;"> v </button>
            <button class="editor-button"
                    @on:click=${_deleteSelectedLayer}
                    style="width: 26px;"> - </button>
        </div>
    </div>`
}


export default { init, view }

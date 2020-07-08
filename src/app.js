import commandbar from './commandbar.js'
import footer     from './footer.js'
import grid       from './grid.js'
import { html }   from './deps.js'
import layers     from './layers.js'
import tileset    from './tileset.js'


function init (options={}) {
    return {
        elm: undefined,
        footer: footer.init(options.footer),
        grid: grid.init(options.grid),
        layers: layers.init(options.layers),
        tileset: tileset.init(options.tileset),
        layersExpanded: true,
        tilesetExpanded: true
    }
}


function view (model, update) {
    const _insertHook = function (vnode) {
        model.elm = vnode.elm

        const o = new ResizeObserver(function (/*entries*/) {
            model.grid.canvasWidth = model.elm.clientWidth
            model.grid.canvasHeight = model.elm.clientHeight
            update()
        })
        
        setTimeout(function () {
            o.observe(model.elm)
        }, 0)
    }

    return html`<div class="outer-container">
        <div class="header">
          <span>Crossroads Level Editor</span>
          <div class="responsive-controls">
            <button class="editor-button">import</button>
            <button class="editor-button">export</button>
          </div>
        </div>

        ${commandbar.view(model, update)}

        <div class="editor-left"></div>

        <div class="editor-main" @hook:insert=${_insertHook}>${grid.view(model.grid, update)}</div>

        <div class="editor-right">
            <div class="panel">
                <div class="panel-header"
                     @on:click=${() => { model.layersExpanded = !model.layersExpanded; update() }}>
                    <span class="expando">${!model.layersExpanded ? '▶ ' : '▼ '}</span>Layers
                </div>
                <div @style:display=${model.layersExpanded ? '' : 'none'}>
                    ${layers.view(model, update)}
                </div>
            </div>

            <div class="panel">
                <div class="panel-header"
                     @on:click=${() => { model.tilesetExpanded = !model.tilesetExpanded; update() }}>
                    <span class="expando">${!model.tilesetExpanded ? '▶ ' : '▼ '}</span>Tileset
                </div>
                <div class="panel-content"
                     @style:display=${model.tilesetExpanded ? '' : 'none'}>${tileset.view(model, update)}</div>
            </div>

        </div>

        ${footer.view(model, update)}
      </div>`
}


export default { init, view }

import bresenham       from './bresenham.js'
import buildCells      from './build-layer-cells.js'
import constants       from './constants.js'
import createArray     from './create-array.js'
import { clamp, html } from './deps.js'


function init (options={}) {
    const cols = options.columns || 100
    const rows = options.rows || 100

    const image = new Image()
    image.src = `assets/tileset1.png`

    return {
        canvas: undefined,
        context: undefined,
        canvasWidth: 0,
        canvasHeight: 0,
        scrollX: 0,
        scrollY: 0,
        hoverX: 0,
        hoverY: 0,
        activeCommand: 'drawTile',   // drawTile | eraseTile

        // TODO: these should be moved into a mode specific context 
        // drawTile specific variables
        down: false,
        lastCol: 0,
        lastRow: 0,


        commandStack: {
            commands: [ ], // e.g.,  { cmd: 'draw', cell: 306, tile: 14 }
            redo: [ ]
        },
        
        level: {
            name: options.name || 'test',
            cols,
            rows,
            selectedLayer: 1, // the id of the selected layer
            selectedTile: 3,
            layers: {
                1: {
                    name: 'init',
                    type: 'tile',   // tile | object
                    cells: createArray(cols * rows, 0),
                    locked: false,
                    visible: true
                }
            },
            layerOrder: [
                1
            ],
            tileset: {
                name: 'main tileset',
                padding: 1,
                cols: 120,
                rows: 120,
                filename: 'tileset1.png',
                image
            }
        }
    }
}


function _drawCanvas (model) {
   
    // reset transform to identity matrix
    model.context.setTransform(1, 0, 0, 1, 0, 0)

    model.context.clearRect(
        0,
        0,
        model.canvasWidth,
        model.canvasHeight
    )

    model.context.translate(-model.scrollX, -model.scrollY)


    const levelWidth = model.level.cols * constants.TILE_SIZE
    const levelHeight = model.level.rows * constants.TILE_SIZE

    model.context.mozImageSmoothingEnabled = false
    model.context.webkitImageSmoothingEnabled = false
    model.context.msImageSmoothingEnabled = false
    model.context.imageSmoothingEnabled = false

    model.context.strokeStyle = 'rgba(0,0,0,0.2)'
    model.context.lineWidth = 1 //1 / window.devicePixelRatio

    model.context.beginPath()  


    let y = 0
    while (y <= levelHeight) {
        model.context.moveTo(0.5, y + 0.5)
        model.context.lineTo(levelWidth + 0.5, y + 0.5)
        y += constants.TILE_SIZE
    }

    let x = 0
    while (x <= levelWidth) {
        model.context.moveTo(x + 0.5, 0.5)
        model.context.lineTo(x + 0.5, levelHeight + 0.5)
        x+= constants.TILE_SIZE
    }

    model.context.stroke()

    for (const layerId of model.level.layerOrder) {
        const layer = model.level.layers[layerId]

        if (layer.type !== 'tile' || !layer.visible)
            continue

        for (let r=0; r < model.level.rows; r++) {
            for (let c=0; c < model.level.cols; c++) {
                let cell = layer.cells[r * model.level.cols + c]

                if (!cell)
                    continue

                cell--

                const col = cell % model.level.tileset.cols
                const row = Math.floor(cell / model.level.tileset.cols)

                // account for the 1px of padding between each tile in the spritesheet
                const paddingX = col + model.level.tileset.padding
                const paddingY = row + model.level.tileset.padding

                const sx = col * constants.TILE_SIZE + paddingX
                const sy = row * constants.TILE_SIZE + paddingY


                model.context.drawImage(
                    model.level.tileset.image,
                    sx,
                    sy,
                    constants.TILE_SIZE,
                    constants.TILE_SIZE,
                    c * constants.TILE_SIZE,
                    r * constants.TILE_SIZE,
                    constants.TILE_SIZE,
                    constants.TILE_SIZE
                )

            }
        }
    }
}


function view (model, update) {
    const _mousedown = function (ev) {
        // if the layer is locked, don't draw on it
        if (model.level.layers[model.level.selectedLayer].locked)
            return

        model.down = true

        const x = ev.offsetX + model.scrollX
        const y = ev.offsetY + model.scrollY

        const col = Math.floor(x / constants.TILE_SIZE)
        const row = Math.floor(y / constants.TILE_SIZE)

        model.lastCol = col
        model.lastRow = row

        const cellIdx = row * model.level.cols + col

        
        const cmd = {
            type: model.activeCommand,
            layerId: model.level.selectedLayer,
            cellIdx,
        }

        if (model.activeCommand === 'drawTile') {
            cmd.tileIdx = model.level.selectedTile
        }

        if (model.activeCommand === 'eraseTile') {
            cmd.tileIdx = 0
        }

        model.commandStack.commands.push(cmd)

        // new commands have been applied and we're not at the top of the undo stack, so clear
        // the unapplied commands
        model.commandStack.redo.length = 0

        // build the layer up from the commands
        const cells = createArray(model.level.rows * model.level.cols, 0)
       
        for (let i=0; i < model.commandStack.commands.length; i++) {
            const cmd = model.commandStack.commands[i]
           
            if (cmd.layerId !== model.level.selectedLayer)
                continue

            if (cmd.type === 'drawTile' || cmd.type === 'eraseTile')
                cells[cmd.cellIdx] = cmd.tileIdx
        }

        buildCells(model)
    }

    const _mousemove = function (ev) {
        model.hoverX = ev.offsetX + model.scrollX
        model.hoverY = ev.offsetY + model.scrollY

        if (model.down) {
            const col = Math.floor(ev.layerX / constants.TILE_SIZE)
            const row = Math.floor(ev.layerY / constants.TILE_SIZE)

            bresenham(model.lastCol, model.lastRow, col, row, function (c, r) {
               
                const cellIdx = r * model.level.cols + c
                
                const cmd = {
                    type: model.activeCommand,
                    layerId: model.level.selectedLayer,
                    cellIdx,
                }

                // TODO: consider a draw line command

                if (model.activeCommand === 'drawTile')
                    cmd.tileIdx = model.level.selectedTile

                if (model.activeCommand === 'eraseTile')
                    cmd.tileIdx = 0

                // if the cell isn't actually changed, don't add the command
                if (model.level.layers[model.level.selectedLayer].cells[cellIdx] !== cmd.tileIdx)
                    model.commandStack.commands.push(cmd)
            })
            
            model.lastCol = col
            model.lastRow = row
            buildCells(model)
        }
        update()
    }

    const _mouseup = function (ev) {
        model.down = false
    }

    const _insertHook = function (vnode) {
        model.canvas = vnode.elm
        model.context = model.canvas.getContext('2d')

        const _draw = function () {
            _drawCanvas(model)
            requestAnimationFrame(_draw)
        }

        requestAnimationFrame(_draw)
    }


    const _wheel = function (ev) {
        ev.preventDefault()

        const levelWidth = model.level.cols * constants.TILE_SIZE
        const levelHeight = model.level.rows * constants.TILE_SIZE
        model.scrollX = clamp(model.scrollX + ev.deltaX, 0, levelWidth)
        model.scrollY = clamp(model.scrollY + ev.deltaY, 0, levelHeight)
    }

    const width = model.canvasWidth //model.canvas ? model.canvas.parentNode.clientWidth : 0
    const height = model.canvasHeight //model.canvas ? (model.canvas.parentNode.clientHeight - 3) : 0

    return html`<canvas width=${width}
                        height=${height}
                        style="display:fixed; background-color: #bfbfbf; width: ${width}px; height: ${height}px; box-sizing: border-box; padding: 0; margin: 0;"
                        @on:wheel=${_wheel}
                        @on:mousedown=${_mousedown}
                        @on:mouseup=${_mouseup}
                        @on:mouseleave=${_mouseup}
                        @on:mousemove=${_mousemove}
                        @hook:insert=${_insertHook}></canvas>`
}


export default { init, view }

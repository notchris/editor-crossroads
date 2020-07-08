import createArray from './create-array.js'


function buildLayerCells (model, layerIdx) {
    const cells = createArray(model.level.rows * model.level.cols, 0)
    
    for (let i=0; i < model.commandStack.commands.length; i++) {
        const cmd = model.commandStack.commands[i]
       
        if (cmd.layerIdx !== layerIdx)
            continue

        if (cmd.type === 'drawTile' || cmd.type === 'eraseTile')
            cells[cmd.cellIdx] = cmd.tileIdx
    }
   
    return cells
}


export default function rebuildAllLayerCells (model) {
    model.level.layers.forEach(function (layer, layerIdx) {
        if (layer.type === 'tile')
            layer.cells = buildLayerCells(model, layerIdx)
    })
}

import createArray from './create-array.js'


function buildLayerCells (model, layerId) {
    const cells = createArray(model.level.rows * model.level.cols, 0)
    
    for (let i=0; i < model.commandStack.commands.length; i++) {
        const cmd = model.commandStack.commands[i]
       
        if (cmd.layerId !== layerId)
            continue

        if (cmd.type === 'drawTile' || cmd.type === 'eraseTile')
            cells[cmd.cellIdx] = cmd.tileIdx
    }
   
    return cells
}


export default function rebuildAllLayerCells (model) {
    model.level.layerOrder.forEach(function (layerId) {
        const layer = model.level.layers[layerId]
        if (layer.type === 'tile')
            layer.cells = buildLayerCells(model, layerId)
    })
}

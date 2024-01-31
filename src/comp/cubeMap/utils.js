import * as THREE     from 'three';


export function displayCanvasesInGrid(canvasArray,  gridSize) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imageSize = canvasArray[0].width; // Assuming all canvases have the same size

    canvas.width = Math.ceil(canvasArray.length / gridSize) * imageSize;
    canvas.height = gridSize * imageSize;

    for (let i = 0; i < canvasArray.length; i++) {
        const row = i % gridSize;
        const col = Math.floor(i / gridSize);
        const x = col * imageSize;
        const y = row * imageSize;

        ctx.drawImage(canvasArray[i], x, y);
    }
    return canvas
}


export function downloadFile(data, filename_=`0`) {
    let filename = `${filename_}_exported.obj`
    const blob = new Blob([data], { type: 'text/plain' });
  
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
  
    // Append the link to the body and click it
    document.body.appendChild(link);
    link.click();
  
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
  
  export let canvasFlip = (fcanvas, rtt)=>{
    var ctx = fcanvas.getContext('2d');
    //https://jsfiddle.net/miguelmyers8/n5trq07w/3/
    var scaleH =  -1 
    var scaleV =  1 

    var posX =  rtt.rtWidth * -1  // Set x position to -100% if flip horizontal 
    var posY =  0; // Set y position to -100% if flip vertical

    ctx.save(); // Save the current state
    ctx.scale(scaleH, scaleV); // Set scale to flip the image
    ctx.drawImage(fcanvas, posX, posY, rtt.rtWidth, rtt.rtWidth); // draw the image
    ctx.restore(); // Restore the last saved state

    var scaleH =  -1 
    var scaleV =  -1 

    var posX =  rtt.rtWidth * -1  // Set x position to -100% if flip horizontal 
    var posY =  rtt.rtWidth * -1; // Set y position to -100% if flip vertical

    ctx.save(); // Save the current state
    ctx.scale(scaleH, scaleV); // Set scale to flip the image
    ctx.drawImage(fcanvas, posX, posY, rtt.rtWidth, rtt.rtWidth); // draw the image
    ctx.restore(); // Restore the last saved state
}


export const createTextureFromImage = (imageUrl) => {
    const canvas = document.createElement('canvas');
    const texture = new THREE.CanvasTexture(canvas);
  
    new THREE.ImageLoader().load(imageUrl, image => {
      const ctx = canvas.getContext('2d');
  
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.clearRect(0.0, 0.0, canvas.width, canvas.height);
  
      ctx.drawImage(image, 0.0, 0.0, image.width, image.height);
    });
  
    return texture;
  };
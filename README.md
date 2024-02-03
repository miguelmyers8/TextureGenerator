# TextureGenerator

## About
This project creates textures from procedural algorithms using the Three.js node material graph.

## Basic Usage

```javascript 
    let cubeMapDownload  = false
    const cubeMap = new CubeMap()
    cubeMap.build(3000,renderer_)
    cubeMap.simplexFbm({
        inScale:          7.0,
        scale_:           5.5,
        outScale:         0.3,
        seed_:            1.0,
        normalScale:      .08,
        redistribution_:   6.,
        persistance_:     .35,
        lacunarity_:       2.,
        iteration_:        15,
        terbulance_:    false,
        ridge_:         false,
    })
    cubeMap.simplexFbm({
        inScale:          7.0,
        scale_:           2.0,
        outScale:         0.8,
        seed_:            1.0,
        normalScale:      .08,
        redistribution_:   4.,
        persistance_:     .35,
        lacunarity_:       2.2,
        iteration_:        15,
        terbulance_:    false,
        ridge_:         false,
    })
    cubeMap.cube.material.colorNode = cubeMap.toNormal({
        scale:    1.5,  
        epsilon: 0.001,  
        strength:   1.,    
    })
    cubeMap.light(NODE.vec3(1.8,-1.8,1.8),8)
    cubeMap.color({
        inScale:          1.0,
        scale_:           0.5,
        outScale:         0.8,
        seed_:            1.0,
        normalScale:      .08,
        redistribution_:   1.0,
        persistance_:     .5,
        lacunarity_:       3.5,
        iteration_:        15,
        terbulance_:    true,
        ridge_:         false,
    })
    cubeMap.snapShot(cubeMapDownload)
```

<p align="center">
  <img src="./public/mainimg.png" />
</p>
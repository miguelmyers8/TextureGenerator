import * as NODE from 'three/nodes';
import {glslFn} from 'three/nodes';

export const defualtLight = glslFn(`
  float defualtLight(vec4 normalMap, vec3 lightPosition, vec3 cP) {
    vec3  lightDirection = normalize(lightPosition - normalMap.xyz);
    float diff = max(dot(normalize(normalMap.rgb), (lightDirection)), 0.0);
    return diff;
  }
`)

export const permute       = glslFn(`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}`)
export const taylorInvSqrt = glslFn(`vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}`)
export const snoise3D      = glslFn(`
float snoise3D(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0; 
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ ); 

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
`,[permute,taylorInvSqrt])


export const  snoise3Dfbm = glslFn(`
float fbm(vec3 v_, float seed_, float scale_,float persistance_,float lacunarity_,float redistribution_, int iteration_,bool terbulance_, bool ridge_  ) {
  vec3 v = v_; 
  v += (seed_ * 100.0);
  float persistance = persistance_;
  float lacunarity = lacunarity_;
  float redistribution = redistribution_;
  bool terbulance = terbulance_;
  bool ridge = terbulance_ && ridge_;

  float result = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float maximum = amplitude;

  for (int i = 0; i < iteration_; i++) {

    vec3 p = v * frequency * scale_;

    float noiseVal = snoise3D(p);

    if (terbulance)
      noiseVal = abs(noiseVal);

    if (ridge)
      noiseVal = -1.0 * noiseVal;

    result += noiseVal * amplitude;

    frequency *= lacunarity;
    amplitude *= persistance;
    maximum += amplitude;
  }

  float redistributed = pow(result, redistribution);
  return redistributed / maximum;
}
`,[snoise3D])


export  const  snoise3DDisplacementNormalFBM = glslFn(` 
vec3 displacementNormalNoiseFBM(
    vec3 wp, vec3 vn,vec3 tangent, float seed, float scale, float normalScale, float persistance,float lacunarity,float redistribution,  int iteration,bool terbulance, bool ridge){
    float n = fbm(wp,  seed,  scale, persistance, lacunarity, redistribution,  iteration, terbulance,  ridge);  
    vec3 displacedPosition = wp + vn * n;
    float offset = normalScale;
    vec3 tangent_ = tangent.xyz;
    vec3 bitangent = normalize(cross(vn, tangent_));
    vec3 neighbour1 = wp + tangent_ * offset;
    vec3 neighbour2 = wp + bitangent * offset;
    vec3 displacedNeighbour1 = neighbour1 + vn * fbm(neighbour1,  seed,  scale, persistance, lacunarity, redistribution,   iteration, terbulance,  ridge );
    vec3 displacedNeighbour2 = neighbour2 + vn * fbm(neighbour2,  seed,  scale, persistance, lacunarity, redistribution,   iteration, terbulance,  ridge );
    vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
    vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;
    vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
    return displacedNormal;
  }

  `,[snoise3Dfbm])


  export  const  displacementFBM = glslFn(` 
  float displacementFBM(
      vec3 wp, vec3 vn,vec3 tangent, float seed, float scale, float persistance,float lacunarity,float redistribution, int iteration,bool terbulance, bool ridge){
      float n = fbm(wp,  seed,  scale, persistance, lacunarity, redistribution,   iteration, terbulance,  ridge);  
      return n;
    }
  
    `,[snoise3Dfbm])

  export  const  pattern = glslFn(` 
  float pattern(vec3 wp, float seed, float scale,  float persistance,float lacunarity,float redistribution,  int iteration,bool terbulance, bool ridge){
        float p1 = fbm( wp+ vec3(2.0,3.0,0.0),  seed,  scale, persistance, lacunarity, redistribution,  iteration, terbulance,  ridge );
        float p2 = fbm( wp+ vec3(5.2,1.3,3.2),  seed,  scale, persistance, lacunarity, redistribution,  iteration, terbulance,  ridge );
        float p3 = fbm( wp+ vec3(3.2,4.3,2.6),  seed,  scale, persistance, lacunarity, redistribution,  iteration, terbulance,  ridge );

        vec3 q = vec3( p1 , p2, p3);

        float p1r = fbm( wp+ 4.0*q +vec3(1.7,9.2,0.0),  seed,  scale, persistance, lacunarity, redistribution,  iteration, terbulance,  ridge );
        float p2r = fbm( wp+ 4.0*q +vec3(2.3,2.8,3.2),  seed,  scale, persistance, lacunarity, redistribution,  iteration, terbulance,  ridge );
        float p3r = fbm( wp+ 4.0*q +vec3(5.2,9.3,5.6),  seed,  scale, persistance, lacunarity, redistribution,  iteration, terbulance,  ridge );

        vec3 r = vec3( p1r , p2r, p3r);

      return fbm( (wp + 2.0 * r),  seed,  scale, persistance, lacunarity, redistribution,  iteration, terbulance,  ridge );
    }
  
    `,[snoise3Dfbm])



    export  const  customNoiseNormal = (custom) =>{
      return glslFn(` 
      vec3 customNoiseNormal(
          vec3 wp, vec3 vn,vec3 tangent, float seed, float scale, float normalScale, float persistance,float lacunarity,float redistribution,  int iteration,bool terbulance, bool ridge){
          float n = customNoise(wp);  
          vec3 displacedPosition = wp + vn * n;
          float offset = normalScale;
          vec3 tangent_ = tangent.xyz;
          vec3 bitangent = normalize(cross(vn, tangent_));
          vec3 neighbour1 = wp + tangent_ * offset;
          vec3 neighbour2 = wp + bitangent * offset;
          vec3 displacedNeighbour1 = neighbour1 + vn * customNoise(neighbour1);
          vec3 displacedNeighbour2 = neighbour2 + vn * customNoise(neighbour2);
          vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
          vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;
          vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
          return displacedNormal;
        }
      
        `,[glslFn(custom,[snoise3Dfbm])])
    }
    


  export  const  displacementNormalNoiseFBMWarp = glslFn(` 
  vec3 displacementNormalNoiseFBMWarp(
      vec3 wp, vec3 vn,vec3 tangent, float seed, float scale, float normalScale, float persistance,float lacunarity,float redistribution,  int iteration,bool terbulance, bool ridge){
      float n = pattern(wp,  seed,  scale, persistance, lacunarity, redistribution,  iteration, terbulance,  ridge);  
      vec3 displacedPosition = wp + vn * n;
      float offset = normalScale;
      vec3 tangent_ = tangent.xyz;
      vec3 bitangent = normalize(cross(vn, tangent_));
      vec3 neighbour1 = wp + tangent_ * offset;
      vec3 neighbour2 = wp + bitangent * offset;
      vec3 displacedNeighbour1 = neighbour1 + vn * pattern(neighbour1,  seed,  scale, persistance, lacunarity, redistribution,   iteration, terbulance,  ridge );
      vec3 displacedNeighbour2 = neighbour2 + vn * pattern(neighbour2,  seed,  scale, persistance, lacunarity, redistribution,   iteration, terbulance,  ridge );
      vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
      vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;
      vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
      return displacedNormal;
    }
  
    `,[pattern])

  export  const  displacementNoiseFBMWarp = glslFn(` 
  float displacementNormalNoiseFBM(
      vec3 wp, vec3 vn,vec3 tangent, float seed, float scale, float normalScale, float persistance,float lacunarity,float redistribution,  int iteration,bool terbulance, bool ridge){
      float n = pattern(wp,  seed,  scale, persistance, lacunarity, redistribution,  iteration, terbulance,  ridge);  
      return n;
    }
  
    `,[pattern])


    export const blackToWhiteGradient = glslFn(`
    vec3 blackToWhiteGradient(float radius, vec3 vUv){
        vec3 uv = vUv; 
        float f = smoothstep( radius * radius,0.0, dot(uv, uv));
        return  vec3(f);
    }
    `)
    
    
    export  const whiteToBlackGradient = glslFn(`
    vec3 whiteToBlackGradient(float radius,vec2 vUv){
        vec2 center = vec2(0.5, 0.5); 
        vec2 uv = vUv - center;
        float f = smoothstep(0.0,radius * radius, dot(uv, uv));
        return  vec3(f);
    }
    `)
    
    export  const RGBMod = glslFn(`
    vec3 RGBMod(vec3 color, float r, float g, float b){
        vec3 c = color;
        c.r += r;
        c.g += g;
        c.b += b;
        return c;
    }
    `)
  
    export const uvTransforms = (scale,offset=NODE.vec2(0.0,0.0))=>{
      var uv = NODE.uv()
      var newUV = uv.mul(scale).add(0.5 * (1.0-scale)).add(offset)
      return newUV
    }


    export const Lambertian = glslFn(`
    vec3 Lambertian(vec3 Normal,vec3 LightDir,vec3 LightColor,vec4 AmbientColor, vec3 Falloff){
      vec3 N = normalize(Normal.xyz);
      vec3 L = normalize(LightDir.xyz);
      vec3 Diffuse = LightColor * max(dot(N, L), 0.0);
      float D = length(LightDir);
      vec3 Ambient = AmbientColor.rgb * AmbientColor.a;
      float Attenuation = 1.0 / ( Falloff.x + (Falloff.y*D) + (Falloff.z*D*D) );
      vec3 Intensity = Ambient + Diffuse * Attenuation;
      vec3 FinalColor = Diffuse.rgb * Intensity;

      return FinalColor;
    }

    `)


    let nt = (displacementMap,vUv) =>{
      let scale    = 0.9;   // Adjust this to control the amount of displacement
      let epsilon  = 0.009;  // Small value for calculating gradients
      let strength = 1.;   
    
      let center = NODE.texture(displacementMap, vUv).r; // Sample displacement map
      let dx = NODE.texture(displacementMap, vUv.add(NODE.vec2(epsilon, 0.0))).r.sub(center);  // Calculate gradients in the X  directions
      let dy = NODE.texture(displacementMap, vUv.add(NODE.vec2(0.0, epsilon))).r.sub(center);  // Calculate gradients in the Y directions
      let normalMap = NODE.normalize(NODE.vec3(dx.mul(scale), dy.mul(scale), 1.0));               // Calculate the normal vector
      normalMap = normalMap.mul(strength);                                                       // Apply strength to the normal vector
      return normalMap.mul(0.5 ).add(0.5)
    }


    const displace = (tex,uv) =>{
      return NODE.texture(tex,uv)
     }
  const textureNormal = (tangent,bitangent,position, normal, texture, vUv) =>{
        let displacedPosition = normal.mul(displace(texture,vUv)).add(position)
        let texelSize = .0001; // temporarily hardcoding texture resolution
        let offset = 1.;
        let neighbour1 = tangent.mul(offset).add(position)
        let neighbour2 = bitangent.mul(offset).add(position)
        let neighbour1uv = vUv.add(NODE.vec2(-texelSize,0))
        let neighbour2uv = vUv.add(NODE.vec2(0,-texelSize))
        let displacedNeighbour1 = normal.mul(displace(texture,neighbour1uv)).add(neighbour1)
        let displacedNeighbour2 = normal.mul(displace(texture,neighbour2uv)).add(neighbour2)
        let displacedTangent = displacedNeighbour1.sub(displacedPosition)
        let displacedBitangent = displacedNeighbour2.sub(displacedPosition)
        let displacedNormal = NODE.normalize(NODE.cross(displacedTangent, displacedBitangent));
        return displacedNormal.mul(0.5).add(0.5);
      }
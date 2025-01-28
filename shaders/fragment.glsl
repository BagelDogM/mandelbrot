#ifdef GL_ES
precision highp float;
#endif

uniform float size;
uniform float initial_size;
uniform vec2 center;
uniform sampler2D tex;

const int iter = 1024;
const float log2 = log(2.0);

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 color(float c) {
    return texture2D(tex, vec2(mod(c, 1.0), 1));
    //return vec3(0, 0, 0);
}

vec2 transform(float x, float y, vec2 center, float size) {
    float x_boundleft = center[0] - (size / 2.0);
    float x_boundright = center[0] + (size / 2.0);
    float y_boundleft = center[1] - (size/ 2.0);
    float y_boundright = center[1] + (size / 2.0);
    
    float xboundrange = (x_boundright - x_boundleft);
    float yboundrange = (y_boundright - y_boundleft);
    
    float xtransform = xboundrange / initial_size;
    float ytransform = yboundrange / initial_size;
    
    return vec2(x * xtransform + x_boundleft, y * ytransform + y_boundleft);
}

void main() {
    vec2 st = gl_FragCoord.xy;
    
    //old_center = transform(center[0], center[1], old_center, size);
    //vec2 center = vec2(-0.4811840920781893, -0.6143931112825788);//vec2(-.745,.186);
    vec2 coords = transform(st.x, st.y, center, size);

    float zx,zy=0.0;
    float cx = coords[0];
    float cy = coords[1];
    
    bool done = false;
    for (int i=0;i<iter;i++) {
        float tempzy = zy;
        
        zy = 2.0*zx*zy;
        zy = zy + cy;
        
        zx = zx*zx - tempzy*tempzy;
        zx = zx + cx;
        
        float z_val = sqrt(zx*zx + zy*zy);
        if (sqrt(zx*zx + zy*zy) > 2000.0) {
            float fractional = 1.0 - log(log(z_val)) / log2;

            float hue = (float(i)+fractional)/float(iter);
            //hue = hue-floor(hue);
            gl_FragColor = color(hue);
            done = true;
            break;
        }
    }
    if (!done) {
        gl_FragColor = vec4(vec3(0, 0, 0),1.0);
    }

    //if ((390 < int(st.x) && int(st.x) < 410 && int(st.y) == 400) ||
    //(390 < int(st.y) && int(st.y) < 410 && int(st.x) == 400)) {
    //    gl_FragColor = vec4(0.4, 1.0, 1.0, 1.0);
    //}
  }

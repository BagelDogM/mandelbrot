#ifdef GL_ES
precision highp float;
#endif

uniform float size;         // The size (in the complex plane) of the part of the fractal we are rendering.
uniform float canvas_size;  // Smallest side of canvas. Used in transformations from gl_fragCoord to complex plane co-ordinates.
uniform vec2 center;        // Center of render.
uniform sampler2D tex;      // Texture for coloring.
uniform int iter;           // The maximum number of iterations we run to.

const float log2 = log(2.0);

// This is the upper limit that the iter uniform can be to make GLSL happy.
const int iterations_upper_lim = 4096;

vec4 color(float c) {
    return texture2D(tex, vec2(min(c, 1.0), 1));
}

vec2 transform(float x, float y, vec2 center, float size) {
    float xtransform = size / canvas_size;
    float ytransform = size / canvas_size;
    
    float x_boundleft = center[0] - (size / 2.0);
    float y_boundleft = center[1] - (size / 2.0);

    return vec2(x * xtransform + x_boundleft, y * ytransform + y_boundleft);
}

float mandel() {
    // Calculate co-ordinates
    vec2 st = gl_FragCoord.xy;
    
    vec2 coords = transform(st.x, st.y, center, size);

    float zx,zy=0.0;
    float cx = coords[0];
    float cy = coords[1];
    
    // periodicity checking
    float x_old = 0.0;
    float y_old = 0.0;
    int period = 0;

    // We don't actually iterate using *our* iteration limit, rather an upper bound.
    // this is because GLSL can't run a loop using a non-constant value so we have to instead
    // break within the loop if we exceed our limit.
    for (int i=0;i<iterations_upper_lim;i++) {
        // mandelbrot calculations
        float tempzy = zy;
        
        zy = 2.0*zx*zy;
        zy = zy + cy;
        
        zx = zx*zx - tempzy*tempzy;
        zx = zx + cx;

        // periodicity checking
        if (x_old == zx && y_old == zy) {
            return 0.;
        }

        period = period + 1;
        if (period == 30) {
            x_old = zx;
            y_old = zy;
            period = 0;
        }
    
        // escape checking
        float z_val = sqrt(zx*zx + zy*zy);
        if (z_val > 2.0) {
            float fractional = 1.0 - log(log(z_val)) / log2;
            float value = float(i)+fractional;

            float hue = value/float(iter);
            hue = max(min(hue, 1.0), 0.0001); // Don't clamp to exactly 0 because that's used for the inside of the set.

            return hue;
        }

        // If we've exceeded the iteration limit that we set (but the loop hasn't yet ended, 
        // because that uses something different) we exit and know we are in the set.
        if (i>iter) {
            return 0.;
        }
    }
  }

// Actually color the pixels.
void main() {
    float n = mandel();
    if (n == 0.) {
        gl_FragColor = vec4(vec3(0, 0, 0),1.0);
    } else {
        gl_FragColor = color(n);//vec4(hsv2rgb(vec3(hue, 1, 1)),1.0);
    }
}
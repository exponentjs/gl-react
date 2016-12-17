import Exponent from 'exponent';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  createSurface,
  GLSL,
  Node,
  Shaders,
} from 'gl-react';


const Surface = createSurface({
  GLView: class extends React.Component {
    render() {
      const { onContextCreate, children, ...rest } = this.props;
      return (
        <View {...rest}>
          <Exponent.GLView
            style={{ flex: 1 }}
            onContextCreate={(gl) => {
                // gl.enableLogging = true;
                const oldGetUniformLocation = gl.getUniformLocation;
                gl.getUniformLocation = (...args) => {
                  console.warn('omg');
                  return oldGetUniformLocation.apply(gl, args);
                }
                onContextCreate(gl);
              }}
          />
          <View style={{ opacity: 0 }}>
            {children}
          </View>
        </View>
      );
    }

    afterDraw(gl) {
      gl.flush();
      gl.endFrameEXP();
    }
  },

  getPixelSize: ({ width, height }) => [width, height],

  RenderLessElement: View,
})


const shaders = Shaders.create({
  helloGL: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float red;
void main() {
  gl_FragColor = vec4(red, 1.0, 0.0, 1.0);
}`,
  },

  tunnel: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float iGlobalTime;
void main() {
  vec2 p = 2.0 * uv - vec2(1.0);
  float a = atan(p.y,p.x);
  float r = pow( pow(p.x*p.x,4.0) + pow(p.y*p.y,4.0), 1.0/8.0 );
  vec2 uv = vec2( 1.0/r + 0.2*iGlobalTime, a );
  float f = cos(12.0*uv.x)*cos(6.0*uv.y);
  vec3 col = 0.5 + 0.5*sin( 3.1416*f + vec3(0.0,0.5,1.0) );
  col = col*r;
  gl_FragColor = vec4( col, 1.0 );
}`
  },
});


class Loop extends React.Component {
  state = {
    time: 0,
    tick: 0,
  };

  componentDidMount() {
    return;
    const start = global.nativePerformanceNow();
    const animate = () => {
      this._requestAnimationFrameID = requestAnimationFrame(animate);
      const now = global.nativePerformanceNow();
      this.setState(({ tick }) => ({ time: now - start, tick: tick + 1 }));
    };
    this._requestAnimationFrameID = requestAnimationFrame(animate);
  }

  componentWillUnmount() {
    if (this._requestAnimationFrameID) {
      cancelAnimationFrame(this._requestAnimationFrameID);
    }
  }

  render() {
    return (
      <Node
        shader={shaders.tunnel}
        uniforms={{ iGlobalTime: this.state.time }}
      />
    );
  }
}


class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Surface width={100} height={100}>
          <Node
            shader={shaders.helloGL}
            uniforms={{ red: 1 }}
          />
        </Surface>
        <Surface width={100} height={100}>
          <Loop />
        </Surface>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

Exponent.registerRootComponent(App);

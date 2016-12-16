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
                gl.enableLogging = true;
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
void main() {
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}`,
  },
});


class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Surface width={100} height={100}>
          <Node shader={shaders.helloGL} />
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

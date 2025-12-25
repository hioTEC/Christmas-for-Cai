// 简化版React Three Fiber圣诞祝福页面主组件

const { useState, useRef, useEffect } = React;
const { Canvas, useFrame } = ReactThreeFiber;
const { OrbitControls, Stars } = ReactThreeDrei;

// 星星组件
function Star({ position, scale, color }) {
  const starRef = useRef();
  
  useFrame((state) => {
    if (starRef.current) {
      starRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      starRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <mesh ref={starRef} position={position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

// 线框装饰组件
function WireFrameDecoration({ type }) {
  const decorationRef = useRef();
  
  useFrame((state) => {
    if (decorationRef.current) {
      decorationRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const wireFrameGeometry = () => {
    switch (type) {
      case 'box':
        return React.createElement('boxGeometry', { args: [1, 1, 1] });
      case 'sphere':
        return React.createElement('sphereGeometry', { args: [1, 16, 16] });
      case 'torus':
        return React.createElement('torusGeometry', { args: [1, 0.4, 16, 100] });
      case 'octahedron':
        return React.createElement('octahedronGeometry', { args: [1] });
      default:
        return React.createElement('dodecahedronGeometry', { args: [1] });
    }
  };

  return React.createElement('mesh', { ref: decorationRef }, [
    wireFrameGeometry(),
    React.createElement('meshBasicMaterial', {
      color: '#C5A059',
      wireframe: true,
      transparent: true,
      opacity: 0.6
    })
  ]);
}

// 圣诞树组件
function ChristmasTree({ treeNumber }) {
  const treeRef = useRef();
  
  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const getTreeConfig = () => {
    const configs = [
      // 经典绿树
      {
        colors: {
          main: '#10B981',
          decoration: '#EF4444',
          lights: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1']
        },
        ornaments: 12
      },
      // 冰霜蓝树
      {
        colors: {
          main: '#0EA5E9',
          decoration: '#F1F5F9',
          lights: ['#E0F2FE', '#7DD3FC', '#0EA5E9', '#0284C7']
        },
        ornaments: 10
      },
      // 温暖橙树
      {
        colors: {
          main: '#F97316',
          decoration: '#FFFFFF',
          lights: ['#FED7AA', '#FDBA74', '#FB923C', '#F97316']
        },
        ornaments: 14
      },
      // 深绿金树
      {
        colors: {
          main: '#059669',
          decoration: '#C5A059',
          lights: ['#FCD34D', '#F59E0B', '#D97706', '#C5A059']
        },
        ornaments: 16
      }
    ];
    return configs[treeNumber % configs.length];
  };

  const config = getTreeConfig();
  
  // 生成装饰品位置
  const generateOrnaments = () => {
    const ornaments = [];
    for (let i = 0; i < config.ornaments; i++) {
      const angle = (i / config.ornaments) * Math.PI * 2;
      const radius = 0.8 + Math.random() * 0.3;
      const height = -2 + (i / config.ornaments) * 4;
      
      ornaments.push({
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ],
        color: i % 2 === 0 ? config.colors.decoration : config.colors.main,
        scale: 0.1 + Math.random() * 0.05
      });
    }
    return ornaments;
  };

  const ornaments = generateOrnaments();

  // 创建树层
  const treeLayers = [];
  
  // 树干
  treeLayers.push(
    React.createElement('mesh', { 
      key: 'trunk', 
      position: [0, -2.5, 0] 
    }, [
      React.createElement('cylinderGeometry', { key: 'trunk-geo', args: [0.2, 0.3, 1] }),
      React.createElement('meshStandardMaterial', { 
        key: 'trunk-mat', 
        color: '#8B4513' 
      })
    ])
  );
  
  // 树层
  for (let index = 0; index < 4; index++) {
    // 锥形树层
    treeLayers.push(
      React.createElement('mesh', {
        key: `layer-${index}`,
        position: [0, -1 + index * 0.8, 0],
        rotation: [0, 0, 0]
      }, [
        React.createElement('coneGeometry', {
          key: `layer-geo-${index}`,
          args: [1.2 - index * 0.2, 0.8, 8]
        }),
        React.createElement('meshStandardMaterial', {
          key: `layer-mat-${index}`,
          color: config.colors.main,
          roughness: 0.3,
          metalness: 0.1
        })
      ])
    );
    
    // 装饰品
    ornaments
      .filter((_, i) => i % 4 === index)
      .map((ornament, i) => 
        React.createElement('mesh', {
          key: `ornament-${index}-${i}`,
          position: ornament.position,
          scale: ornament.scale
        }, [
          React.createElement('sphereGeometry', {
            key: `ornament-geo-${index}-${i}`,
            args: [0.1, 8, 8]
          }),
          React.createElement('meshStandardMaterial', {
            key: `ornament-mat-${index}-${i}`,
            color: ornament.color,
            emissive: config.colors.lights[i % config.colors.lights.length],
            emissiveIntensity: 0.2
          })
        ])
      );
    
    // 小灯串
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 1.0 - index * 0.15;
      const height = -1 + index * 0.8;
      const lightColor = config.colors.lights[i % config.colors.lights.length];
      
      treeLayers.push(
        React.createElement('mesh', {
          key: `light-${index}-${i}`,
          position: [
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
          ]
        }, [
          React.createElement('sphereGeometry', {
            key: `light-geo-${index}-${i}`,
            args: [0.05, 6, 6]
          }),
          React.createElement('meshBasicMaterial', {
            key: `light-mat-${index}-${i}`,
            color: lightColor,
            emissive: lightColor,
            emissiveIntensity: 0.5
          })
        ])
      );
    }
  }
  
  // 星星装饰
  treeLayers.push(
    React.createElement('mesh', {
      key: 'star',
      position: [0, 1.5, 0]
    }, [
      React.createElement('octahedronGeometry', {
        key: 'star-geo',
        args: [0.2]
      }),
      React.createElement('meshBasicMaterial', {
        key: 'star-mat',
        color: '#FFD700',
        emissive: '#FFD700',
        emissiveIntensity: 0.4
      })
    ])
  );

  return React.createElement('group', { ref: treeRef, scale: [1.5, 2, 1.5] }, treeLayers);
}

// 主场景组件
function Scene({ treeNumber }) {
  const starElements = [];
  
  for (let i = 0; i < 20; i++) {
    starElements.push(
      React.createElement(Star, {
        key: `star-${i}`,
        position: [
          (Math.random() - 0.5) * 20,
          Math.random() * 10 - 5,
          (Math.random() - 0.5) * 20
        ],
        scale: 0.5 + Math.random() * 0.5,
        color: ['#FFD700', '#C5A059', '#F9F8F4'][Math.floor(Math.random() * 3)]
      })
    );
  }

  return React.createElement(React.Fragment, null, [
    // 环境光
    React.createElement('ambientLight', {
      key: 'ambient',
      intensity: 0.4
    }),
    
    // 主要光源
    React.createElement('pointLight', {
      key: 'point1',
      position: [10, 10, 10],
      intensity: 0.8,
      color: '#C5A059'
    }),
    React.createElement('pointLight', {
      key: 'point2',
      position: [-10, -10, -10],
      intensity: 0.3,
      color: '#10B981'
    }),
    
    // 圣诞树
    React.createElement(ChristmasTree, {
      key: 'tree',
      treeNumber: treeNumber
    }),
    
    // 3D线框装饰
    React.createElement(WireFrameDecoration, {
      key: 'wire-box',
      type: 'box'
    }),
    React.createElement(WireFrameDecoration, {
      key: 'wire-sphere',
      type: 'sphere'
    }),
    React.createElement(WireFrameDecoration, {
      key: 'wire-torus',
      type: 'torus'
    }),
    
    // 星星背景
    React.createElement(Stars, {
      key: 'stars-bg',
      radius: 100,
      depth: 50,
      count: 5000,
      factor: 4,
      saturation: 0,
      fade: true,
      speed: 1
    }),
    
    // 装饰性星星
    ...starElements,
    
    // 轨道控制
    React.createElement(OrbitControls, {
      key: 'controls',
      enableZoom: false,
      enablePan: false,
      autoRotate: true,
      autoRotateSpeed: 0.5
    })
  ]);
}

// 主应用组件
function App() {
  const [treeNumber, setTreeNumber] = useState(0);
  const [showGoldenParticles, setShowGoldenParticles] = useState(false);

  const handleTreeClick = () => {
    setTreeNumber(prev => prev + 1);
    setShowGoldenParticles(true);
    setTimeout(() => setShowGoldenParticles(false), 2000);
  };

  // 创建金箔粒子效果
  useEffect(() => {
    if (showGoldenParticles) {
      const container = document.querySelector('.golden-particles');
      if (container) {
        container.innerHTML = '';
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.animationDelay = Math.random() * 2 + 's';
          particle.style.animationDuration = (3 + Math.random() * 3) + 's';
          container.appendChild(particle);
        }
      }
    }
  }, [showGoldenParticles]);

  return React.createElement(React.Fragment, null, [
    // 金箔粒子背景
    React.createElement('div', {
      key: 'particles',
      className: 'golden-particles'
    }),
    
    React.createElement('div', {
      key: 'container',
      className: 'container'
    }, [
      React.createElement('div', {
        key: 'hero-section',
        className: 'hero-section',
        onClick: handleTreeClick
      }, [
        React.createElement('div', {
          key: 'tree-container',
          className: 'tree-container'
        }, [
          React.createElement(Canvas, {
            key: 'canvas',
            camera: {
              position: [0, 0, 8],
              fov: 60,
              near: 0.1,
              far: 100
            },
            style: { background: 'transparent' }
          }, [
            React.createElement(Scene, {
              key: 'scene',
              treeNumber: treeNumber
            })
          ]),
          React.createElement('div', {
            key: 'click-hint',
            className: 'click-hint'
          }, '点击圣诞树换一棵新树 ✨')
        ])
      ]),
      
      React.createElement('div', {
        key: 'blessing-section',
        className: 'blessing-section'
      }, [
        React.createElement('div', {
          key: 'main-message',
          className: 'main-message'
        }, 'Sweet dear Cai'),
        React.createElement('div', {
          key: 'christmas-message',
          className: 'christmas-message'
        }, 'Merry Christmas')
      ])
    ])
  ]);
}

// 渲染应用
ReactDOM.render(React.createElement(App), document.getElementById('root'));
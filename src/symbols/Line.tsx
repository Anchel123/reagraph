import React, { FC, useMemo, useRef } from 'react';
import { useSpring, a } from '@react-spring/three';
import { animationConfig, EdgeVectors3, getCurvePoints } from '../utils';
import {
  Vector3,
  TubeBufferGeometry,
  CatmullRomCurve3,
  ColorRepresentation,
  Color
} from 'three';
import { useStore } from '../store';

export interface LineProps {
  color?: ColorRepresentation;
  size?: number;
  animated?: boolean;
  id: string;
  opacity?: number;
  curved: boolean;
  points: EdgeVectors3;
  onClick?: () => void;
  onActive?: (state: boolean) => void;
  onContextMenu?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

export const Line: FC<LineProps> = ({
  color,
  id,
  size,
  opacity,
  points,
  animated,
  curved = false,
  onContextMenu,
  onActive,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const tubeRef = useRef<TubeBufferGeometry | null>(null);
  const draggingId = useStore(state => state.draggingId);
  const normalizedColor = useMemo(() => new Color(color), [color]);

  // Do opacity seperate from vertices for perf
  const { lineOpacity } = useSpring({
    from: {
      lineOpacity: 0
    },
    to: {
      lineOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });

  useSpring(
    () => ({
      from: {
        fromVertices: [0, 0, 0],
        toVertices: [0, 0, 0]
      },
      to: {
        fromVertices: [points.from?.x, points.from?.y, points.from?.z || 0],
        toVertices: [points.to?.x, points.to?.y, points.to?.z || 0]
      },
      onChange: event => {
        const { fromVertices, toVertices } = event.value;
        const fromVector = new Vector3(...fromVertices);
        const toVector = new Vector3(...toVertices);
        const curvePoints = getCurvePoints(fromVector, toVector);

        const curve = curved
          ? new CatmullRomCurve3(curvePoints)
          : new CatmullRomCurve3([fromVector, toVector]);
        tubeRef.current.copy(
          new TubeBufferGeometry(curve, 20, size / 2, 5, false)
        );
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? undefined : 0
      }
    }),
    [animated, draggingId, points, size]
  );

  return (
    <mesh
      userData={{ id, type: 'edge' }}
      onPointerOver={() => {
        onActive(true);
        onPointerOver?.();
      }}
      onPointerOut={() => {
        onActive(false);
        onPointerOut?.();
      }}
      onClick={onClick}
      onPointerDown={event => {
        // context menu controls
        if (event.nativeEvent.buttons === 2) {
          event.stopPropagation();
          onContextMenu();
        }
      }}
    >
      <tubeBufferGeometry attach="geometry" ref={tubeRef} />
      <a.meshBasicMaterial
        attach="material"
        opacity={lineOpacity}
        fog={true}
        transparent={true}
        depthTest={false}
        color={normalizedColor}
      />
    </mesh>
  );
};

Line.defaultProps = {
  color: '#000',
  size: 1,
  opacity: 1,
  curved: false
};

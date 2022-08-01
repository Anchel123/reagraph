import React, {
  FC,
  forwardRef,
  Fragment,
  Ref,
  useImperativeHandle
} from 'react';
import { useGraph } from './useGraph';
import { LayoutTypes } from './layout';
import {
  ContextMenuEvent,
  GraphEdge,
  GraphNode,
  InternalGraphEdge,
  InternalGraphNode
} from './types';
import { SizingType } from './sizing';
import {
  Edge,
  EdgeArrowPosition,
  EdgeLabelPosition,
  EdgeShape,
  Node
} from './symbols';
import { useCenterGraph } from './CameraControls';
import { LabelVisibilityType } from './utils';
import { Theme } from './utils';
import { useStore } from './store';
import { Graph } from 'ngraph.graph';

export interface GraphSceneProps {
  /**
   * Theme to use for the graph.
   */
  theme: Theme;

  /**
   * Type of layout.
   */
  layoutType?: LayoutTypes;

  /**
   * List of ids that are selected.
   */
  selections?: string[];

  /**
   * List of ids that are active.
   */
  actives?: string[];

  /**
   * Animate or not the graph positions.
   */
  animated?: boolean;

  /**
   * Nodes to pass to the graph.
   */
  nodes: GraphNode[];

  /**
   * Edges to pass to the graph.
   */
  edges: GraphEdge[];

  /**
   * Context menu element.
   */
  contextMenu?: (event: ContextMenuEvent) => React.ReactNode;

  /**
   * Type of sizing for nodes.
   */
  sizingType?: SizingType;

  /**
   * Type of visibility for labels.
   */
  labelType?: LabelVisibilityType;

  /**
   * Place of visibility for edge labels.
   */
  edgeLabelPosition?: EdgeLabelPosition;

  /**
   * Placement of edge arrows.
   */
  edgeArrowPosition?: EdgeArrowPosition;

  /**
   * Shape of edge.
   */
  edgeShape?: EdgeShape;

  /**
   * Font of label, same as troika-three-text
   * The URL of a custom font file to be used. Supported font formats are: * .ttf * .otf * .woff (.woff2 is not supported)
   * Default: The Roboto font loaded from Google Fonts CDN
   */
  labelFontUrl?: string;

  /**
   * Attribute based sizing property.
   */
  sizingAttribute?: string;

  /**
   * The default size to size nodes to. Default is 7.
   */
  defaultNodeSize?: number;

  /**
   * When using sizing attributes, the min size a node can be.
   */
  minNodeSize?: number;

  /**
   * When using sizing attributes, the max size a node can be.
   */
  maxNodeSize?: number;

  /**
   * Attribute used for clustering.
   */
  clusterAttribute?: string;

  /**
   * Disable interactions or not.
   */
  disabled?: boolean;

  /**
   * Allow dragging of nodes.
   */
  draggable?: boolean;

  /**
   * When a node was clicked.
   */
  onNodeClick?: (node: InternalGraphNode) => void;

  /**
   * When a node context menu happened.
   */
  onNodeContextMenu?: (node: InternalGraphNode) => void;

  /**
   * When node got a pointer over.
   */
  onNodePointerOver?: (node: InternalGraphNode) => void;

  /**
   * When node lost pointer over.
   */
  onNodePointerOut?: (node: InternalGraphNode) => void;

  /**
   * When a edge context menu happened.
   */
  onEdgeContextMenu?: (edge?: InternalGraphEdge) => void;

  /**
   * When an edge was clicked.
   */
  onEdgeClick?: (edge: InternalGraphEdge) => void;

  /**
   * When edge got a pointer over.
   */
  onEdgePointerOver?: (edge: InternalGraphEdge) => void;

  /**
   * When edge lost pointer over.
   */
  onEdgePointerOut?: (edge: InternalGraphEdge) => void;
}

export interface GraphSceneRef {
  /**
   * Reference to the ngraph object.
   */
  graph: Graph;

  /**
   * Center the graph on a node or list of nodes.
   */
  centerGraph: (ids?: string[]) => void;
}

export const GraphScene: FC<GraphSceneProps & { ref?: Ref<GraphSceneRef> }> =
  forwardRef(
    (
      {
        onNodeClick,
        onNodeContextMenu,
        onEdgeContextMenu,
        onEdgeClick,
        onEdgePointerOver,
        onEdgePointerOut,
        onNodePointerOver,
        onNodePointerOut,
        contextMenu,
        theme,
        animated,
        disabled,
        draggable,
        edgeLabelPosition,
        edgeArrowPosition,
        labelFontUrl,
        edgeShape = 'line',
        ...rest
      },
      ref
    ) => {
      useGraph(rest);

      const [graph, nodeIds, edgeIds] = useStore(state => [
        state.graph,
        state.nodes.map(n => n.id),
        state.edges.map(e => e.id)
      ]);

      const { centerNodesById: centerGraph } = useCenterGraph({
        animated
      });

      useImperativeHandle(
        ref,
        () => ({
          centerGraph,
          graph
        }),
        [centerGraph, graph]
      );

      return (
        <Fragment>
          {nodeIds.map(n => (
            <Node
              key={n}
              id={n}
              labelFontUrl={labelFontUrl}
              draggable={draggable}
              disabled={disabled}
              animated={animated}
              theme={theme}
              contextMenu={contextMenu}
              onClick={onNodeClick}
              onContextMenu={onNodeContextMenu}
              onPointerOver={onNodePointerOver}
              onPointerOut={onNodePointerOut}
            />
          ))}
          {edgeIds.map(e => (
            <Edge
              theme={theme}
              key={e}
              id={e}
              disabled={disabled}
              animated={animated}
              curved={edgeShape === 'curve'}
              labelPlacement={edgeLabelPosition}
              arrowPlacement={edgeArrowPosition}
              contextMenu={contextMenu}
              onClick={onEdgeClick}
              onContextMenu={onEdgeContextMenu}
              onPointerOver={onEdgePointerOver}
              onPointerOut={onEdgePointerOut}
            />
          ))}
        </Fragment>
      );
    }
  );

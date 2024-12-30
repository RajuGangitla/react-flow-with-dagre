// types.ts

import { Node, Edge, Connection } from '@xyflow/react';

export type NodeType = 'startNode' | 'instruction' | 'condition';

export type NodeData = {
    content?: string | any[];
}

export type CustomNode = Node<NodeData>


export interface FlowEdge extends Edge {
    animated: boolean;
}

export interface FlowState {
    nodes: CustomNode[];
    edges: FlowEdge[];
    nodeCount: number;
}

export interface FlowStore {
    // State
    nodes: CustomNode[];
    edges: FlowEdge[];
    nodeCount: number;

    // Actions
    addNode: (type: 'instruction' | 'condition', sourceNodeId: string) => void;
    deleteNode: (nodeId: string) => void;
    updateNodeContent: (nodeId: string, content: string) => void;
    onNodesChange: (changes: any) => void;
    onEdgesChange: (changes: any) => void;
    onConnect: (connection: Connection) => void;
    updateLayout: () => void;
}
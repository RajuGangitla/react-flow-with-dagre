import { create } from 'zustand';
import dagre from 'dagre';
import { Connection, addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { CustomNode, FlowEdge, FlowStore } from '@/types/flow';
import { nanoid } from 'nanoid'

const NODE_WIDTH = 300;
const NODE_HEIGHT = 200;
const VERTICAL_SPACING = 150;
const HORIZONTAL_SPACING = 400;

const getLayoutedElements = (nodes: CustomNode[], edges: FlowEdge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: 'TB',
        nodesep: HORIZONTAL_SPACING,
        ranksep: VERTICAL_SPACING,
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            type: node.type
        });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const dagreNode = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: dagreNode.x - NODE_WIDTH / 2,
                y: dagreNode.y - NODE_HEIGHT / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

export const useFlowStore = create<FlowStore>((set, get) => ({
    nodes: [{
        id: '1',
        data: { label: 'Starting point' },
        position: { x: 0, y: 0 },
        type: 'startNode',
    }],
    edges: [],
    nodeCount: 2,

    addNode: (type: 'instruction' | 'condition', sourceNodeId: string) => {
        const { nodes, edges, nodeCount } = get();

        const sourceNode = nodes.find(node => node.id === sourceNodeId);
        if (!sourceNode) return;

        const existingEdges = edges.filter(edge => edge.source === sourceNodeId);
        const existingTargetNodes = existingEdges
            .map(edge => nodes.find(node => node.id === edge.target))
            .filter(Boolean) as CustomNode[];

        const newNode: CustomNode = {
            id: nanoid(),
            data: { content: '' },
            position: { x: 0, y: 0 },
            type: type,
        };

        let updatedEdges = [...edges];
        let newNodes = [...nodes, newNode];

        // Case 1: Adding instruction node between parent and multiple condition nodes
        if (type === 'instruction' &&
            existingTargetNodes.length > 0 &&
            existingTargetNodes.every(node => node.type === 'condition')) {

            updatedEdges = edges.filter(edge => !existingEdges.includes(edge));

            updatedEdges.push({
                id: nanoid(),
                source: sourceNodeId,
                target: newNode.id,
                animated: true,
            });

            existingTargetNodes.forEach(conditionNode => {
                updatedEdges.push({
                    id: nanoid(),
                    source: newNode.id,
                    target: conditionNode.id,
                    animated: true,
                });
            });
        }
        // Case 2: Adding instruction node between parent and existing instruction
        else if (type === 'instruction' &&
            existingTargetNodes.length === 1 &&
            existingTargetNodes[0].type === 'instruction') {

            const existingNode = existingTargetNodes[0];
            updatedEdges = edges.filter(edge => edge.id !== existingEdges[0].id);

            updatedEdges.push(
                {
                    id: nanoid(),
                    source: sourceNodeId,
                    target: newNode.id,
                    animated: true,
                },
                {
                    id: nanoid(),
                    source: newNode.id,
                    target: existingNode.id,
                    animated: true,
                }
            );
        }
        // Case 3: Adding condition node when parent has existing condition
        else if (type === 'condition' &&
            existingTargetNodes.some(node => node.type === 'condition')) {
            const followUpNode: CustomNode = {
                id: nanoid(),
                data: { content: '' },
                position: { x: 0, y: 0 },
                type: 'instruction',
            };
            newNodes.push(followUpNode);
            updatedEdges.push(
                {
                    id: nanoid(),
                    source: sourceNodeId,
                    target: newNode.id,
                    animated: true,
                },
                {
                    id: nanoid(),
                    source: newNode.id,
                    target: followUpNode.id,
                    animated: true,
                });
        }
        // Case 4: Adding condition node between parent and instruction
        else if (type === 'condition' &&
            existingTargetNodes.length === 1 &&
            existingTargetNodes[0].type === 'instruction') {

            const followUpNode: CustomNode = {
                id: nanoid(),
                data: { content: '' },
                position: { x: 0, y: 0 },
                type: 'instruction',
            };
            newNodes.push(followUpNode);

            const existingNode = existingTargetNodes[0];
            updatedEdges = edges.filter(edge => edge.id !== existingEdges[0].id);

            updatedEdges.push(
                {
                    id: nanoid(),
                    source: sourceNodeId,
                    target: newNode.id,
                    animated: true,
                },
                {
                    id: nanoid(),
                    source: newNode.id,
                    target: followUpNode.id,
                    animated: true,
                },
                {
                    id: nanoid(),
                    source: followUpNode.id,
                    target: existingNode.id,
                    animated: true,
                }
            );
        }
        // Default case: Add direct connection
        else {
            if (type === 'condition') {
                const followUpNode: CustomNode = {
                    id: nanoid(),
                    data: { content: '' },
                    position: { x: 0, y: 0 },
                    type: 'instruction',
                };
                newNodes.push(followUpNode);
                updatedEdges.push(
                    {
                        id: nanoid(),
                        source: sourceNodeId,
                        target: newNode.id,
                        animated: true,
                    },
                    {
                        id: nanoid(),
                        source: newNode.id,
                        target: followUpNode.id,
                        animated: true,
                    });
            } else {
                updatedEdges.push({
                    id: nanoid(),
                    source: sourceNodeId,
                    target: newNode.id,
                    animated: true,
                });
            }
        }

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            newNodes,
            updatedEdges
        );

        set({
            nodes: layoutedNodes,
            edges: layoutedEdges,
            nodeCount: nodeCount + 1,
        });
    },

    deleteNode: (nodeId: string) => {
        const { nodes, edges } = get();

        // Simply remove the node and any connected edges
        const newNodes = nodes.filter(node => node.id !== nodeId);
        const newEdges = edges.filter(
            edge => edge.source !== nodeId && edge.target !== nodeId
        );

        set({
            nodes: newNodes,
            edges: newEdges
        });
    },

    updateNodeContent: (nodeId: string, content: string) => {
        const { nodes } = get();
        const updatedNodes = nodes.map((node) => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        content,
                    },
                };
            }
            return node;
        });

        set({ nodes: updatedNodes });
    },

    onNodesChange: (changes) => set({
        nodes: applyNodeChanges(changes, get().nodes),
    }),

    onEdgesChange: (changes) => set({
        edges: applyEdgeChanges(changes, get().edges),
    }),

    onConnect: (connection: Connection) => {
        const { nodes, edges } = get();
        const newEdges = addEdge({ ...connection, animated: true, id: nanoid() }, edges);

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            newEdges
        );

        set({
            nodes: layoutedNodes,
            edges: layoutedEdges,
        });
    },

    updateLayout: () => {
        const { nodes, edges } = get();
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges
        );

        set({
            nodes: layoutedNodes,
            edges: layoutedEdges,
        });
    },
}));
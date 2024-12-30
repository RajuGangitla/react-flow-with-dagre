// AutoLayoutFlow.tsx

"use client"

import React from 'react';
import {
    ReactFlow,
    Node,
    Background,
    Controls,
    NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { StartNode } from './nodes/StartNode';
import { InstructionNode } from './nodes/InstructionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { useFlowStore } from '@/stores/flow';


const nodeTypes: NodeTypes = {
    startNode: StartNode,
    instruction: InstructionNode,
    condition: ConditionNode,
};

const AutoLayoutFlow: React.FC = () => {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
    } = useFlowStore();


    return (
        <div className="h-screen w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                nodeTypes={nodeTypes}
                className="bg-gray-50"
                nodesDraggable={false}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default AutoLayoutFlow;
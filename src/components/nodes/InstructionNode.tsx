"use client";

import { Trash2, Plus, CircleCheck, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Handle, Position } from "@xyflow/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFlowStore } from "@/stores/flow";
import { Textarea } from "../ui/textarea";


export function InstructionNode({ id, data }: { id: string; data: any }) {
    const { addNode, deleteNode, updateNodeContent } = useFlowStore();

    const handleAddNode = (type: "instruction" | "condition") => {
        addNode(type, id);
    };

    return (
        <div className="relative bg-gray-500 rounded-lg shadow-sm p-4 w-[300px]">
            <Handle type="target" position={Position.Top} />

            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue rounded-sm" />
                    <span className="font-medium">Instruction</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteNode(id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex h-[100px] overflow-y-auto w-full flex-col rounded-md bg-background border border-input shadow-sm focus-within:border-primary">
                <Textarea
                    value={data.content || ''}
                    onChange={(e) => updateNodeContent(id, e.target.value)}
                    placeholder="Enter instruction..."
                    className="min-h-[80px] resize-none border-0 focus-visible:ring-0"
                />
            </div>

            <div className="flex items-center justify-center mt-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-0">
                        <div className="flex flex-col">
                            <div
                                onClick={() => handleAddNode("instruction")}
                                className="flex items-center gap-2 p-2 rounded-t-sm text-sm transition-colors cursor-pointer"
                            >
                                <CircleCheck className="w-4 h-4" /> Instruction
                            </div>
                            <div
                                onClick={() => handleAddNode("condition")}
                                className="flex items-center gap-2 p-2 rounded-b-sm text-sm transition-colors cursor-pointer"
                            >
                                <GitFork className="rotate-180 w-4 h-4" /> Conditional
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}
"use client";

import { Handle, Position } from "@xyflow/react";
import { CircleCheck, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useFlowStore } from "@/stores/flow";


export function StartNode({ id }: { id: string }) {
    const [open, setOpen] = useState(false);
    const { addNode } = useFlowStore();

    const handleAddNode = (type: "instruction" | "condition") => {
        addNode(type, id);
        setOpen(false);
    };

    return (
        <div className="relative bg-gray-500 rounded-lg shadow-md p-2 w-[300px] border border-gray">
            <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-emerald rounded-sm" />
                <span className="font-medium text-gray">Starting point</span>
            </div>

            <Handle type="source" position={Position.Bottom} />

            <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 transition-opacity"
                style={{ top: "100%", marginTop: "5px" }}>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="default" size="sm" className="shadow-lg">
                            + First step
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-0" align="center">
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
        </div>
    );
}

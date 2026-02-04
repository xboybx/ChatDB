"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Paintbrush, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

const themes = [
    { name: "Zinc", value: "zinc", color: "#52525b" },
    { name: "Rose", value: "rose", color: "#e11d48" },
    { name: "Blue", value: "blue", color: "#2563eb" },
    { name: "Green", value: "green", color: "#16a34a" },
    { name: "Orange", value: "orange", color: "#ea580c" },
];

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [color, setColor] = useState("zinc");

    // Load color from local storage on mount
    useEffect(() => {
        const savedColor = localStorage.getItem("theme-color") || "zinc";
        setColor(savedColor);
        document.body.setAttribute("data-theme", savedColor);
    }, []);

    const handleColorChange = (newColor) => {
        setColor(newColor);
        localStorage.setItem("theme-color", newColor);
        document.body.setAttribute("data-theme", newColor);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2">
                    <Paintbrush className="mr-2 h-4 w-4" />
                    Themes
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" /> System
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Accent Color</DropdownMenuLabel>
                <div className="grid grid-cols-5 gap-1 p-2">
                    {themes.slice(0, 1).map((t) => (
                        <button
                            key={t.value}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${color === t.value ? "border-primary scale-110" : "border-transparent"
                                }`}
                            style={{ backgroundColor: t.color }}
                            onClick={() => handleColorChange(t.value)}
                            title={t.name}
                        />
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

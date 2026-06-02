import { definePlugin } from "@decky/api";
import { PanelSection, SliderField, staticClasses, ToggleField } from "@decky/ui";
import { useState } from "react";
import { FaTv } from "react-icons/fa";

function PerformanceSlider({
    initialValue,
    onChange,
}: {
    initialValue: number;
    onChange: (v: number) => void;
}) {
    const [enabled, setEnabled] = useState(false);
    const [value, setValue] = useState(initialValue);

    return (
        <>
            <ToggleField
                label="Apply level on change"
                description="Whether the overlay should be updated when changing to this mode"
                checked={enabled}
                onChange={(e) => setEnabled(e)}
            />
            <SliderField
                label="Performance Overlay Level"
                disabled={!enabled}
                value={value}
                min={0}
                max={4}
                step={1}
                notchCount={5}
                notchTicksVisible={false}
                notchLabels={[
                    {
                        notchIndex: 0,
                        label: "OFF",
                    },
                    {
                        notchIndex: 1,
                        label: "1",
                    },
                    {
                        notchIndex: 2,
                        label: "2",
                    },
                    {
                        notchIndex: 3,
                        label: "3",
                    },
                    {
                        notchIndex: 4,
                        label: "4",
                    },
                ]}
                onChange={(v) => {
                    setValue(v);
                    onChange(v);
                }}
            />
        </>
    );
}

function onHandheldChange(level: number) {
  // todo
}

function onDockedChange(level: number) {
  // todo
}

function Content() {
    return (
        <>
            <PanelSection title="Handheld Mode">
                <PerformanceSlider initialValue={0} onChange={onHandheldChange} />
            </PanelSection>
            <PanelSection title="Docked Mode">
                <PerformanceSlider initialValue={0} onChange={onDockedChange} />
            </PanelSection>
        </>
    );
}

export default definePlugin(() => {
    return {
        name: "Docked Overlay Switcher",
        titleView: <div className={staticClasses.Title}>Overlay Switcher</div>,
        content: <Content />,
        icon: <FaTv />,
    };
});

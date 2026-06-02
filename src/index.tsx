import { callable, definePlugin } from "@decky/api";
import { PanelSection, SliderField, staticClasses, ToggleField } from "@decky/ui";
import { useEffect, useState } from "react";
import { FaTv } from "react-icons/fa";

type Settings = {
    handheldEnabled: boolean;
    handheldLevel: number;
    dockedEnabled: boolean;
    dockedLevel: number;
};

const getSettings = callable<[], Settings>("get_settings");

const setSettings = callable<[new_settings: Settings], void>("set_settings");

function PerformanceSlider({
    enabled,
    level,
    onEnabledChange,
    onLevelChange,
}: {
    enabled: boolean;
    level: number;
    onEnabledChange: (v: boolean) => void;
    onLevelChange: (v: number) => void;
}) {
    return (
        <>
            <ToggleField
                label="Apply level on change"
                description="Whether the overlay should be updated when changing to this mode"
                checked={enabled}
                onChange={(e) => onEnabledChange(e)}
            />
            <SliderField
                label="Performance Overlay Level"
                disabled={!enabled}
                value={level}
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
                onChange={(v) => onLevelChange(v)}
            />
        </>
    );
}

function Content() {
    const [settings, setUISettings] = useState<Settings | null>(null);

    useEffect(() => {
        getSettings().then((settings) => setUISettings(settings));
    }, []);

    async function dispatch(diff: Partial<Settings>) {
        const newSettings = { ...settings, ...diff } as Settings;
        await setSettings(newSettings); // config file
        setUISettings(newSettings); // local ui
    }

    if (!settings) {
        return "Loading...";
    }

    return (
        <>
            <PanelSection title="Handheld Mode">
                <PerformanceSlider
                    level={settings.handheldLevel}
                    enabled={settings.handheldEnabled}
                    onEnabledChange={(e) => dispatch({ handheldEnabled: e })}
                    onLevelChange={(v) => dispatch({ handheldLevel: v })}
                />
            </PanelSection>
            <PanelSection title="Docked Mode">
                <PerformanceSlider
                    level={settings.dockedLevel}
                    enabled={settings.dockedEnabled}
                    onEnabledChange={(e) => dispatch({ dockedEnabled: e })}
                    onLevelChange={(v) => dispatch({ dockedLevel: v })}
                />
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

import { callable, definePlugin, toaster } from "@decky/api";
import { PanelSection, SliderField, staticClasses, ToggleField } from "@decky/ui";
import { useEffect, useState } from "react";
import { FaTv } from "react-icons/fa";
import { PerfStore } from "./PerfStore";

type Settings = {
    notifyOnChange: boolean;
    handheldEnabled: boolean;
    handheldLevel: number;
    dockedEnabled: boolean;
    dockedLevel: number;
};

const getSettings = callable<[], Settings>("get_settings");

const setSettings = callable<[new_settings: Settings], void>("set_settings");

const isDocked = callable<[], boolean>("is_docked");

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
        return <div style={{ textAlign: "center", width: "100%" }}>Loading...</div>;
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
            <PanelSection title="Other">
                <ToggleField
                    label="Show notification on change"
                    description="Whether to show a notification when the mode is updated successfully"
                    checked={settings.notifyOnChange}
                    onChange={(e) => dispatch({ notifyOnChange: e })}
                />
            </PanelSection>
        </>
    );
}

let lastNotificationInvocation = -1;

async function onDisplayUpdate() {
    const settings = await getSettings();
    const docked = await isDocked();

    const oldIndex = PerfStore.getSteamIndex();
    let newIndex = oldIndex;
    if (docked && settings.dockedEnabled) {
        newIndex = settings.dockedLevel;
    } else if (!docked && settings.handheldEnabled) {
        newIndex = settings.handheldLevel;
    }

    PerfStore.setSteamIndex(newIndex);

    // onDisplayUpdate can fire multiple times per docking/undocking.
    // While this is idempotent to the PerfStore index, sending multiple notifications
    // is intrusive and annoying. A debounce of 1000ms is implemented between notifications
    // to ensure only one can be queued at a time
    if (settings.notifyOnChange && oldIndex !== newIndex && lastNotificationInvocation + 1000 <= Date.now()) {
        lastNotificationInvocation = Date.now();
        toaster.toast({
            title: docked ? "Docked" : "Undocked",
            body: `Switched overlay level from ${oldIndex === 0 ? "OFF" : oldIndex} to ${newIndex === 0 ? "OFF" : newIndex}`,
            // https://gist.github.com/mdeguzis/7bef2731edd67a6dea06ffc622a1bae6
            playSound: false,
            sound: 0,
            eType: 40,
        });
    }
}

export default definePlugin(() => {
    PerfStore.init();
    const listener = SteamClient?.System?.DisplayManager?.RegisterForStateChanges(onDisplayUpdate);
    return {
        name: "Docked Overlay Switcher",
        titleView: <div className={staticClasses.Title}>Overlay Switcher</div>,
        content: <Content />,
        icon: <FaTv />,
        onDismount: () => {
            if (listener) listener.unregister();
        },
    };
});

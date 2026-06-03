from os import getenv
from subprocess import run

import decky
from settings import SettingsManager

# https://wiki.deckbrew.xyz/plugin-dev/getting-started#settingsmanager

settings = SettingsManager(name="settings", settings_directory=getenv("DECKY_PLUGIN_SETTINGS_DIR"))
settings.read()

class Plugin:
    async def _main(self):
        pass
 
    async def get_settings(self) -> dict[str, int | bool]:
        """
        Gets user defined settings from the configuration file.
        """
        settings.read()
        return {
            "notifyOnChange": settings.getSetting("notifyOnChange", True),
            "handheldEnabled": settings.getSetting("handheldEnabled", True),
            "handheldLevel": settings.getSetting("handheldLevel", 0),
            "dockedEnabled": settings.getSetting("dockedEnabled", True),
            "dockedLevel": settings.getSetting("dockedLevel", 0)
        }
    
    async def set_settings(self, new_settings: dict[str, int | bool]):
        """
        Updates and commits new user settings.
        """
        for key, value in new_settings.items():
            settings.setSetting(key, value)
        settings.commit()
        
    async def is_docked(self) -> bool:
        """
        Scans currently connected displays to determine if the system is currently "docked" (DisplayPort is connected).
        """
        # Linux DRM will return "disconnected" or "connected"
        res = run(["cat", "/sys/class/drm/card0-DP-1/status"], capture_output=True, text=True, check=False)
        return res.stdout.strip() == "connected"

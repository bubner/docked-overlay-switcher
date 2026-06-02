from os import getenv

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

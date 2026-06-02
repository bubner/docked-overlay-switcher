import decky


class Plugin:
    async def _main(self):
        decky.logger.info("Hello World!")

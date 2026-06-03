// From Perf Overlay Shortcut - syrnyk
// Copyright under the BSD 3-Clause License
// Source: https://github.com/syrnyk/decky-perf-overlay-shortcut/blob/main/src/components/perfStore.ts

/*
BSD 3-Clause License

Copyright (c) 2024, syrnyk
Original Copyright (c) 2022-2024, Steam Deck Homebrew

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import { findModuleChild, sleep } from "@decky/ui";

export class PerfStore {
    private static perfStore: any;

    public static async init() {
        try {
            let perfStoreClass;
            let count = 0;
            while (!this.perfStore) {
                // FIXME: this is deprecated, should be aware of breakage later
                perfStoreClass = findModuleChild((m: any) => {
                    if (typeof m !== "object") return undefined;
                    for (const prop in m) {
                        // If module found contains fps limit prop, keep it and use it to get/set perf overlay level
                        if (m[prop]?.prototype?.SetFPSLimit) return m[prop];
                    }
                });
                this.perfStore = perfStoreClass?.Get();
                await sleep(100);
                count++;
                if (count >= 10) {
                    throw new Error("DOS - Could not find perfStore!");
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    public static getSteamIndex() {
        if (!this.perfStore || this.perfStore?.msgSettingsGlobal?.perf_overlay_level == undefined) {
            return -1;
        }
        switch (this.perfStore?.msgSettingsGlobal?.perf_overlay_level) {
            case 0:
                return 0;
            case 4:
                return 1;
            case 1:
                return 2;
            case 2:
                return 3;
            case 3:
                return 4;
            default:
                return -1;
        }
    }

    public static setSteamIndex(index: number) {
        if (!this.perfStore || !this.perfStore?.SetPerfOverlayLevel) {
            return false;
        }
        let target = 0;
        switch (index) {
            case 0:
                target = 0;
                break;
            case 1:
                target = 4;
                break;
            case 2:
                target = 1;
                break;
            case 3:
                target = 2;
                break;
            case 4:
                target = 3;
                break;
            default:
                return false;
        }
        try {
            this.perfStore?.SetPerfOverlayLevel(target);
        } catch {
            return false;
        }
        return true;
    }
}

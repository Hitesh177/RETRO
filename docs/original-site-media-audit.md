# Original software gallery audit

Source: https://itg-soft.tw/software (indexed text inspected on 2026-11-14).

The original page lists these unique titles under **Gameography**. Its gallery images and click-through content could not be retrieved because the live site timed out from this workspace. Do not assign screenshots from another game as a substitute.

| Original title | Current catalog | Local screenshot folder | Import status |
| --- | --- | --- | --- |
| Never Say Die | Yes | None | Needs original media |
| Peace, Love, Trippy Club | Yes | None | Needs original media |
| Dragon Boat Fest | Yes | `public/games/dragon-boat-fest/` | Verify against original |
| Hungry Ghost Night | Yes | `public/games/hungry-ghost-night/` | Verify against original |
| Piss the Fish | Yes | None | Needs original media |
| Mr Lee's Alishan Tea Collector | Yes | `public/games/mr-lee-alishan/` | Verify against original |
| Vigor Maze | Yes | `public/games/vigor-maze/` | Verify against original |
| Desolate Love | Yes | None | Needs original media |
| HouYi Shot the Suns | Yes | None | Needs original media |
| Dudes with Attitude | Yes | None | Needs original media |

The original page lists these titles under **In Development**. None currently has a matching catalog entry or local screenshot folder; their release status, details, and images must be verified before adding them.

| Original title | Current catalog | Local screenshot folder |
| --- | --- | --- |
| Shihu Shihu, Where Are You? | No | None |
| Chinese New Year Adventure | No | None |
| Minxiong Ghost House | No | None |
| Sydney Wang's Great Adventure | No | None |
| Hot Pot Runs | No | None |

Other local folders (`biocats`, `city-trouble`, `house-in-the-cemetery`) are existing redevelopment assets, not titles shown on the original software page. Keep them separate from this import.

Next step: obtain the original gallery media or an accessible page export, then map each image to its exact title and update `src/data/mockData.js` and the product gallery records. Do not rerun the database seed against an edited live catalog.

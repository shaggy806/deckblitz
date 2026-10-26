import { defineCard } from "../define.js";

// EDHREC rank 23107.
//
// Rulings:
//   [2013-04-15] Renounce the Guilds doesn't target any player and may be cast even if a player
//     doesn't control a multicolored permanent.
//   [2013-04-15] The active player (the player whose turn it is) chooses which multicolored
//     permanent will be sacrificed, then each other player in turn order does the same. Then all
//     chosen permanents are sacrificed at the same time.
//
// Crack the Earth's edict, narrowed to multicolored permanents.

export default defineCard({
  name: "Renounce the Guilds",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Each player sacrifices a multicolored permanent of their choice.",
  targets: [],
  effect: { kind: "sacrifice", who: "each-player", filter: { multicolored: true }, count: 1 },
});

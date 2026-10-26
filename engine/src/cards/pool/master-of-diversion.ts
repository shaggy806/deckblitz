import { defineCard } from "../define.js";

// EDHREC rank 27393.
//
// Rulings:
//   [2013-07-01] In multiplayer formats, including Commander, only a creature controlled by the
//     defending player Master of Diversion is attacking can be chosen as the target, even if your
//     other attacking creatures are attacking different players.
//   [2013-07-01] The ability will resolve and the creature will become tapped before blocking
//     creatures are declared.

const TEXT = "Whenever this creature attacks, tap target creature defending player controls.";

export default defineCard({
  name: "Master of Diversion",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});

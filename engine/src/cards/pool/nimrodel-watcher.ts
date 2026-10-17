import { defineCard } from "../define.js";

// EDHREC rank 17481.
//
// Rulings:
//   [2023-06-16] Once Nimrodel Watcher has been blocked, resolving its triggered ability won't
//     change or undo that block.

const TEXT =
  "Whenever you scry, this creature gets +1/+0 until end of turn and can't be blocked this turn. This ability triggers only once each turn.";

export default defineCard({
  name: "Nimrodel Watcher",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "scries", who: "you" },
      oncePerTurn: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

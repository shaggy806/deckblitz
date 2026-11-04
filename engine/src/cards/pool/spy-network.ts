import { defineCard } from "../define.js";

export default defineCard({
  name: "Spy Network",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Look at target player's hand, the top card of that player's library, and any face-down creatures they control. Look at the top four cards of your library, then put them back in any order.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          { kind: "look-at-hand", target: 0 },
          { kind: "look-at-library-top", target: 0 },
          { kind: "look-at-face-down", target: 0 },
        ],
      },
      { kind: "look-and-choose", zone: "library", count: 4, min: 4, max: 4, destination: "library-top", leftover: "stay" },
    ],
  },
});

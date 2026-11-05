import { defineCard } from "../define.js";

// Look only — the cards can't be rearranged (its ruling) — then the library
// stays as it is or is shuffled whole.
export default defineCard({
  name: "Visions",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Look at the top five cards of target player's library. You may then have that player shuffle that library.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-at-library-top", target: 0, count: 5 },
      { kind: "may", prompt: "Have that player shuffle their library?", effect: { kind: "shuffle-library", target: 0 } },
    ],
  },
});

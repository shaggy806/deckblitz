import { defineCard } from "../define.js";

// EDHREC rank 6955.
//
// "Choose land or nonland" is made as the spell resolves, not a modal spell's
// bullets: a resolution-time `modal` of two `reveal-until`s (Evolutionary
// Leap's), one per kind.
const TEXT =
  "Choose land or nonland. Reveal cards from the top of your library until you reveal a card of the chosen kind. Put that card into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Abundant Harvest",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Land",
        effect: { kind: "reveal-until", filter: { type: "land" }, put: "hand", rest: "bottom-random" },
      },
      {
        text: "Nonland",
        effect: { kind: "reveal-until", filter: { notTypes: ["land"] }, put: "hand", rest: "bottom-random" },
      },
    ],
  },
});

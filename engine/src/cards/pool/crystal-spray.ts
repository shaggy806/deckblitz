import { defineCard } from "../define.js";

// EDHREC rank 20398. A text-changing effect (rule 612) until end of turn.

export default defineCard({
  name: "Crystal Spray",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Change the text of target spell or permanent by replacing all instances of one color word with another or one basic land type with another until end of turn.\nDraw a card.",
  targets: [{ kind: "spell-or-permanent" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "change-text", target: 0, words: "color-or-land-type", duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});

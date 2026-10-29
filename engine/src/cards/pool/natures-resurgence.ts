import { defineCard } from "../define.js";

// Each player draws for their own graveyard's creature cards, counted as the
// spell resolves.

const TEXT = "Each player draws a card for each creature card in their graveyard.";

export default defineCard({
  name: "Nature's Resurgence",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "draw",
    who: "each-player",
    amount: { countInGraveyard: { type: "creature", ownedBy: "you" }, forEachPlayer: true },
  },
});

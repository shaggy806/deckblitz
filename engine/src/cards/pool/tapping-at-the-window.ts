import { defineCard } from "../define.js";

// EDHREC rank 18813. Growing Rites of Itlimoc's look-and-choose, the rest to
// the graveyard.

export default defineCard({
  name: "Tapping at the Window",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{2}{G}" },
  text: "Look at the top three cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest into your graveyard.\nFlashback {2}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 3,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "hand",
    leftover: "graveyard",
  },
});

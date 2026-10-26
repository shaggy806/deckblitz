import { defineCard } from "../define.js";

// EDHREC rank 22623. "Put a creature card from among them into your hand" is
// mandatory when one is there (its ruling): `min: 1`, which the engine lowers
// to the number of creature cards revealed.

export default defineCard({
  name: "Tracker's Instincts",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{2}{U}" },
  text: "Reveal the top four cards of your library. Put a creature card from among them into your hand and the rest into your graveyard.\nFlashback {2}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: true,
    min: 1,
    max: 1,
    filter: { type: "creature" },
    destination: "hand",
    leftover: "graveyard",
  },
});

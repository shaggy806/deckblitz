import { defineCard } from "../define.js";

// Dark Ascension (DKA). EDHREC rank 13596. Tolarian Winds' effect, with flashback.

export default defineCard({
  name: "Shattered Perception",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{5}{R}" },
  text: "Discard all the cards in your hand, then draw that many cards.\nFlashback {5}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "you" },
      { kind: "draw", amount: { thisWay: "discarded" } },
    ],
  },
});

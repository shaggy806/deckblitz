import { defineCard } from "../define.js";

// You separate the creature cards in your graveyard (rule 700.3: they stay
// there meanwhile, in order); the opponent you then choose picks the pile
// that's exiled, and the other returns to the battlefield.

const TEXT =
  "Separate all creature cards in your graveyard into two piles. Exile the pile of an opponent's choice and return the other to the battlefield.";

export default defineCard({
  name: "Death or Glory",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "separate-into-piles",
    objects: { graveyard: { type: "creature" } },
    chooser: "an-opponent",
    chosen: "exile",
    rest: "battlefield",
  },
});

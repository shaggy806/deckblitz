import { defineCard } from "../define.js";

// EDHREC rank 15299.
export default defineCard({
  name: "Corpse Explosion",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, exile a creature card from your graveyard.\nCorpse Explosion deals damage equal to the exiled card's power to each creature and each planeswalker.",
  additionalCost: { exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
  effect: {
    kind: "damage-all",
    filter: { typesAnyOf: ["creature", "planeswalker"] },
    amount: { powerOf: { paid: "exiled" } },
  },
});

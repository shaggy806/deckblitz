import { defineCard } from "../define.js";

// "The exiled card" is the cost's one exiled card (`{ paid: "exiled" }`), read
// in exile as it is there.
export default defineCard({
  name: "Corpse Lunge",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text:
    "As an additional cost to cast this spell, exile a creature card from your graveyard.\nCorpse Lunge deals damage equal to the exiled card's power to target creature.",
  additionalCost: { exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { powerOf: { paid: "exiled" } } },
});

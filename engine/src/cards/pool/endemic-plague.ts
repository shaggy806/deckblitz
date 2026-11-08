import { defineCard } from "../define.js";

// Bone Splinters' additional cost; the sweep compares each creature with the
// sacrificed one as it last existed on the battlefield.
export default defineCard({
  name: "Endemic Plague",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a creature.\nDestroy all creatures that share a creature type with the sacrificed creature. They can't be regenerated.",
  additionalCost: { sacrifice: { type: "creature" } },
  effect: {
    kind: "destroy-all",
    filter: { type: "creature", sharesCreatureTypeWith: { paid: "sacrificed" } },
    cantBeRegenerated: true,
  },
});

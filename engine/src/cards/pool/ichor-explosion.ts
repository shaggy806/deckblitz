import { defineCard } from "../define.js";

// EDHREC rank 28446.
//
// X is the sacrificed creature's power as it last existed on the battlefield (the ruling).

export default defineCard({
  name: "Ichor Explosion",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nAll creatures get -X/-X until end of turn, where X is the sacrificed creature's power.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: { product: [{ powerOf: "sacrificed" }, -1] },
    toughness: { product: [{ powerOf: "sacrificed" }, -1] },
    duration: "end-of-turn",
  },
});

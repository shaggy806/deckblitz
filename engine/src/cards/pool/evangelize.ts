import { defineCard } from "../define.js";

// The target is the caster's, chosen by the opponent they name as it's cast
// (`opponentChoosesTargets`, rule 601.2c): one of that opponent's own
// creatures (`controlledBy: "chooser"`), legal as the caster would target it
// — so not a hexproof one. If it's no longer controlled by that opponent as
// Evangelize resolves, it's an illegal target (608.2b).
export default defineCard({
  name: "Evangelize",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  kicker: { cost: "{2}{W}{W}", keyword: "buyback" },
  text: "Buyback {2}{W}{W} (You may pay an additional {2}{W}{W} as you cast this spell. If you do, put this card into your hand as it resolves.)\nGain control of target creature of an opponent's choice they control.",
  targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "chooser" } }],
  opponentChoosesTargets: [0],
  effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
});

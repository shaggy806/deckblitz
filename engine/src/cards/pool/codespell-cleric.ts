import { defineCard } from "../define.js";

// Kaldheim. "If it was the second spell you cast this turn" is the
// intervening-if on its own entry (rule 603.4): it entered as that spell
// resolved, and that spell was the second its caster — you — cast this turn,
// counting the ones countered or still on the stack; put onto the battlefield
// any other way, or a copy, it wasn't cast (`castNthThisTurn`).

const ETB =
  "When this creature enters, if it was the second spell you cast this turn, put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Codespell Cleric",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { castBy: "you", castNthThisTurn: { n: 2, byCaster: true } } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ETB,
    },
  ],
});

import type { EffectAmount } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, for each opponent, goad up to one target creature that opponent controls. Put X +1/+1 counters on this creature, where X is the total power of creatures goaded this way.";

/** "Up to one target creature that opponent controls", one optional slot per
 * opponent seat (Dismantling Wave's shape). */
const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

/** A creature goaded this way: its slot's target, read after the goad. A slot
 * left empty, or blanked as illegal as the ability resolved (rule 608.2b — it
 * wasn't goaded), reads 0. */
const goadedPower = (slot: number): EffectAmount => ({ powerOf: slot });

export default defineCard({
  name: "Havoc Eater",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "goad", target: 0 },
          { kind: "goad", target: 1 },
          { kind: "goad", target: 2 },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { sum: [goadedPower(0), goadedPower(1), goadedPower(2)] },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Felidar Savior's trigger: two distinct optional slots, so the same creature
// can't get both counters (the ruling).

const ETB_TEXT =
  "When this creature enters, put a +1/+1 counter on each of up to two other target creatures you control.";

export default defineCard({
  name: "Basri's Acolyte",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink (Damage dealt by this creature also causes you to gain that much life.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(2, { kind: "other", of: "creature-you-control" }, { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});

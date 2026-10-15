import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 11155.
//
// Rulings:
//   [2024-11-08] You can't target the same creature twice with Felidar Savior's last ability.

const ETB_TEXT =
  "When this creature enters, put a +1/+1 counter on each of up to two other target creatures you control.";

export default defineCard({
  name: "Felidar Savior",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
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

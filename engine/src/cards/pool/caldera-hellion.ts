import { defineCard } from "../define.js";

// Rulings:
//   [2008-10-01] Caldera Hellion will deal 3 damage to itself (as well as to each other creature)
//     when its "enters" ability resolves.

const ETB_TEXT = "When this creature enters, it deals 3 damage to each creature.";

export default defineCard({
  name: "Caldera Hellion",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 3,
  toughness: 3,
  devour: { multiplier: 1, filter: { type: "creature" } },
  text: `Devour 1 (As this creature enters, you may sacrifice any number of creatures. It enters with that many +1/+1 counters on it.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature" }, amount: 3 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});

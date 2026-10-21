import { defineCard } from "../define.js";

// EDHREC rank 24438. An intervening if (rule 603.4): asked as it triggers and
// again as it resolves, not necessarily of the same creature (the ruling).

export default defineCard({
  name: "Turret Ogre",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\nWhen this creature enters, if you control another creature with power 4 or greater, this creature deals 2 damage to each opponent.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "controls",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
        atLeast: 1,
        excludeSelf: true,
      },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: "When this creature enters, if you control another creature with power 4 or greater, this creature deals 2 damage to each opponent.",
    },
  ],
});

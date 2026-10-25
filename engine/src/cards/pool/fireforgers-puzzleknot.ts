import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 29081.
export default defineCard({
  name: "Fireforger's Puzzleknot",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, it deals 1 damage to any target.\n{2}{R}, Sacrifice this artifact: It deals 1 damage to any target.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "When this artifact enters, it deals 1 damage to any target.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{2}{R}, Sacrifice this artifact: It deals 1 damage to any target.",
    },
  ],
});

import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 29081.
const ENTERS = "When this artifact enters, it deals 1 damage to any target.";
const SAC = "{2}{R}, Sacrifice this artifact: It deals 1 damage to any target.";

export default defineCard({
  name: "Fireforger's Puzzleknot",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS}\n${SAC}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: SAC,
    },
  ],
});

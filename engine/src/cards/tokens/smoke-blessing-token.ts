import { defineCard } from "../define.js";

// Smoke Spirits' Aid's Smoke Blessing: a red Aura enchantment token. "It" is the
// creature that died, dealing the damage itself (as it last existed), to whoever
// controlled it then; "you" is the Aura's controller.
const DIES_TEXT =
  "When enchanted creature dies, it deals 1 damage to its controller and you create a Treasure token.";

export default defineCard({
  name: "Smoke Blessing Token",
  art: "5eb01bef-8989-4b38-a303-0aafab1b33e5",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${DIES_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "trigger-controller", from: "trigger-object" },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

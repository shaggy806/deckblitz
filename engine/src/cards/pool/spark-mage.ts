import { defineCard } from "../define.js";

// EDHREC rank 10545.

const TEXT =
  "Whenever this creature deals combat damage to a player, you may have this creature deal 1 damage to target creature that player controls.";

export default defineCard({
  name: "Spark Mage",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Have this creature deal 1 damage to the targeted creature?",
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

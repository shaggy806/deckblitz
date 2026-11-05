import { defineCard } from "../define.js";

// The Land Mine is made first, then the coin is flipped; the token keeps its
// ability whatever happens to the Goblin (the rulings).

const TEXT =
  'At the beginning of your upkeep, create a colorless artifact token named Land Mine with "{R}, Sacrifice this token: This token deals 2 damage to target attacking creature without flying." Then flip a coin. If you lose the flip, this creature deals 2 damage to itself.';

export default defineCard({
  name: "Goblin Kaboomist",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Land Mine Token", count: 1 },
          { kind: "flip-coin", lost: { kind: "damage", amount: 2, target: "source" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

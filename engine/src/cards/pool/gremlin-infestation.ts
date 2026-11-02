import { defineCard } from "../define.js";

const END_STEP = "At the beginning of your end step, this Aura deals 2 damage to enchanted artifact's controller.";
const DIES = "When enchanted artifact is put into a graveyard, create a 2/2 red Gremlin creature token.";

export default defineCard({
  name: "Gremlin Infestation",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${END_STEP}\n${DIES}`,
  targets: ["artifact"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "attached-controller" },
      resolve: null,
      text: END_STEP,
    },
    {
      trigger: { on: "leaves-battlefield", who: "attached", to: ["graveyard"] },
      targets: [],
      effect: { kind: "create-token", token: "2/2 Gremlin Token", count: 1 },
      resolve: null,
      text: DIES,
    },
  ],
});

import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast a multicolored instant or sorcery spell, you may pay {1}. If you do, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Cloven Casting",
  manaCost: "{5}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], multicolored: true },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to copy that spell?",
        cost: "{1}",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

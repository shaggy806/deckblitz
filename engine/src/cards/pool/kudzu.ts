import { defineCard } from "../define.js";

const TEXT = "When enchanted land becomes tapped, destroy it. That land's controller may attach this Aura to a land of their choice.";

// EDHREC rank 26239. Not targeted, and any land will do, including another
// player's (the rulings); without a move the Aura falls off (rule 704.5m).
export default defineCard({
  name: "Kudzu",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: [{ kind: "permanent", whose: "any", filter: { type: "land" } }],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: "attached" },
          {
            kind: "attach",
            target: {
              among: { type: "land" },
              prompt: "You may attach this Aura to a land of your choice",
              optional: true,
              chooser: { controllerOf: "attached" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

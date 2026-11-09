import { defineCard } from "../define.js";

// EDHREC rank 27344. Not targeted (the ruling); it's the destroyed land's
// controller who chooses, and with no other land the Aura goes to the graveyard
// for want of a host (rule 704.5m).
const TEXT =
  "When enchanted land becomes tapped, destroy it and this Aura deals 1 damage to that land's controller. That player attaches this Aura to a land of their choice.";

export default defineCard({
  name: "Steam Vines",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
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
          { kind: "damage", amount: 1, who: { controllerOf: "attached" } },
          {
            kind: "attach",
            target: {
              among: { type: "land" },
              prompt: "Attach this Aura to a land of your choice",
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

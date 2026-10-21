import { defineCard } from "../define.js";

// EDHREC rank 13304. The creature half of Flaxen Intruder // Welcome Home (an
// Adventure, rule 715); the sorcery half is `welcome-home.ts`.
//
// Rulings:
//   [2019-10-04] Flaxen Intruder's triggered ability goes on the stack without a target. While
//     that ability is resolving, you may sacrifice it. When you do, the reflexive triggered
//     ability triggers and you pick a target artifact or enchantment to be destroyed.

const TEXT =
  "Whenever this creature deals combat damage to a player, you may sacrifice it. When you do, destroy target artifact or enchantment.";

export default defineCard({
  name: "Flaxen Intruder",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Flaxen Intruder to destroy an artifact or enchantment?",
        effect: {
          kind: "sacrifice-source",
          then: {
            kind: "reflexive-trigger",
            targets: ["artifact-or-enchantment"],
            effect: { kind: "destroy", target: 0 },
            text: "When you do, destroy target artifact or enchantment.",
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Flaxen Intruder", "Welcome Home"],
  adventure: true,
});

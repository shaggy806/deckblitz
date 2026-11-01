import { defineCard } from "../define.js";

// EDHREC rank 7825.

export default defineCard({
  name: "Ohran Viper",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 1,
  toughness: 3,
  text: "Whenever this creature deals combat damage to a creature, destroy that creature at end of combat.\nWhenever this creature deals combat damage to a player, you may draw a card.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        effect: { kind: "destroy", target: "trigger-recipient" },
        text: "Destroy that creature.",
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a creature, destroy that creature at end of combat.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, you may draw a card.",
    },
  ],
});

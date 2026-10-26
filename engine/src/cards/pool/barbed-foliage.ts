import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 28671.
//
// "Attacks you" is the player, not a planeswalker they control (rule 508.3a).

export default defineCard({
  name: "Barbed Foliage",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever a creature attacks you, it loses flanking until end of turn.\nWhenever a creature without flying attacks you, this enchantment deals 1 damage to it.",
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true, defender: "player" },
      targets: [],
      effect: { kind: "lose-keywords", target: "trigger-object", keywords: ["flanking"], duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a creature attacks you, it loses flanking until end of turn.",
    },
    {
      trigger: {
        on: "attacks",
        who: "any",
        attackingYou: true,
        defender: "player",
        filter: { notKeyword: "flying" },
      },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: "Whenever a creature without flying attacks you, this enchantment deals 1 damage to it.",
    },
  ],
});

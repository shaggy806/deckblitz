import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "When you attack enchanted opponent or a planeswalker they control or when they attack you or a planeswalker you control, sacrifice this Aura.";

export default defineCard({
  name: "Tenuous Truce",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: ["opponent"],
  text: `Enchant opponent\nAt the beginning of enchanted opponent's end step, you and that player each draw a card.\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "draw", amount: 1, who: "active-player" },
        ],
      },
      resolve: null,
      text: "At the beginning of enchanted opponent's end step, you and that player each draw a card.",
    },
    {
      trigger: { on: "attacks", who: "you-control", attackedPlayerOrPlaneswalker: "attached" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "attacks", who: "enchanted-player-controls", attackedPlayerOrPlaneswalker: "you" },
      sameAbilityAs: 1,
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

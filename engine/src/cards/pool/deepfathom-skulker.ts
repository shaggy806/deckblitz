import { defineCard } from "../define.js";

export default defineCard({
  name: "Deepfathom Skulker",
  manaCost: "{5}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 4,
  toughness: 4,
  text: "Devoid (This card has no color.)\nWhenever a creature you control deals combat damage to a player, you may draw a card.\n{3}{C}: Target creature can't be blocked this turn. ({C} represents colorless mana.)",
  activated: [
    {
      cost: { mana: "{3}{C}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{3}{C}: Target creature can't be blocked this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever a creature you control deals combat damage to a player, you may draw a card.",
    },
  ],
});

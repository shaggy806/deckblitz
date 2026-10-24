import { defineCard } from "../define.js";

export default defineCard({
  name: "Skeleton Key",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature has skulk. (It can't be blocked by creatures with greater power.)\nWhenever equipped creature deals combat damage to a player, you may draw a card. If you do, discard a card.\nEquip {2}",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      resolve: null,
      text: "Whenever equipped creature deals combat damage to a player, you may draw a card. If you do, discard a card.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["skulk"],
      text: "Equipped creature has skulk.",
    },
  ],
});

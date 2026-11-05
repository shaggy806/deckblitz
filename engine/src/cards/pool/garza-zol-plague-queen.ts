import { defineCard } from "../define.js";

// EDHREC rank 28402.

export default defineCard({
  name: "Garza Zol, Plague Queen",
  manaCost: "{4}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "haste"],
  text: "Flying, haste\nWhenever a creature dealt damage by Garza Zol this turn dies, put a +1/+1 counter on Garza Zol.\nWhenever Garza Zol deals combat damage to a player, you may draw a card.",
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", damagedThisTurnBy: { source: "this" } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature dealt damage by Garza Zol this turn dies, put a +1/+1 counter on Garza Zol.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever Garza Zol deals combat damage to a player, you may draw a card.",
    },
  ],
});

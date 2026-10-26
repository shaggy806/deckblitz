import { defineCard } from "../define.js";

export default defineCard({
  name: "Springjack Knight",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Knight"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature attacks, clash with an opponent. If you win, target creature gains double strike until end of turn. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "clash",
        won: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      },
      resolve: null,
      text: "Whenever this creature attacks, clash with an opponent. If you win, target creature gains double strike until end of turn.",
    },
  ],
});

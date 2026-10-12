import { defineCard } from "../define.js";

export default defineCard({
  name: "Virulent Swipe",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  rebound: true,
  text: "Target creature gets +2/+0 and gains deathtouch until end of turn.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
    ],
  },
});

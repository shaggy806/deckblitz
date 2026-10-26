import { defineCard } from "../define.js";

export default defineCard({
  name: "Thalakos Drifters",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Thalakos"],
  power: 3,
  toughness: 3,
  text: "Discard a card: This creature gains shadow until end of turn. (It can block or be blocked by only creatures with shadow.)",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "shadow", duration: "end-of-turn" },
      resolve: null,
      text: "Discard a card: This creature gains shadow until end of turn.",
    },
  ],
});

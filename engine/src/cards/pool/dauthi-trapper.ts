import { defineCard } from "../define.js";

export default defineCard({
  name: "Dauthi Trapper",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dauthi", "Minion"],
  power: 1,
  toughness: 1,
  text: "{T}: Target creature gains shadow until end of turn. (It can block or be blocked by only creatures with shadow.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "shadow", duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature gains shadow until end of turn.",
    },
  ],
});

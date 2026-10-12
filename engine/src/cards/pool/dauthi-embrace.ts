import { defineCard } from "../define.js";

export default defineCard({
  name: "Dauthi Embrace",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "{B}{B}: Target creature gains shadow until end of turn. (It can block or be blocked by only creatures with shadow.)",
  activated: [
    {
      cost: { mana: "{B}{B}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "shadow", duration: "end-of-turn" },
      resolve: null,
      text: "{B}{B}: Target creature gains shadow until end of turn.",
    },
  ],
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Soltari Emissary",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Soltari", "Soldier"],
  power: 2,
  toughness: 1,
  text: "{W}: This creature gains shadow until end of turn. (It can block or be blocked by only creatures with shadow.)",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "shadow", duration: "end-of-turn" },
      resolve: null,
      text: "{W}: This creature gains shadow until end of turn.",
    },
  ],
});

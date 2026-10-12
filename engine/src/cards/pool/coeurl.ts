import { defineCard } from "../define.js";

export default defineCard({
  name: "Coeurl",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 2,
  toughness: 2,
  text: "{1}{W}, {T}: Tap target nonenchantment creature.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", notTypes: ["enchantment"] } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{1}{W}, {T}: Tap target nonenchantment creature.",
    },
  ],
});

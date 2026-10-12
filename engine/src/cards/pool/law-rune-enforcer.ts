import { defineCard } from "../define.js";

export default defineCard({
  name: "Law-Rune Enforcer",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: "{1}, {T}: Tap target creature with mana value 2 or greater.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "gte", n: 2 } } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{1}, {T}: Tap target creature with mana value 2 or greater.",
    },
  ],
});

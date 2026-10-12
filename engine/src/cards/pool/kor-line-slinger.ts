import { defineCard } from "../define.js";

export default defineCard({
  name: "Kor Line-Slinger",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Scout"],
  power: 0,
  toughness: 1,
  text: "{T}: Tap target creature with power 3 or less.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 3 } } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{T}: Tap target creature with power 3 or less.",
    },
  ],
});

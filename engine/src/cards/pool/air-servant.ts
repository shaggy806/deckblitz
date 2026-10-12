import { defineCard } from "../define.js";

export default defineCard({
  name: "Air Servant",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{2}{U}: Tap target creature with flying.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{2}{U}: Tap target creature with flying.",
    },
  ],
});

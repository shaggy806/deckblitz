import { defineCard } from "../define.js";

export default defineCard({
  name: "Homarid Shaman",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homarid", "Shaman"],
  power: 2,
  toughness: 1,
  text: "{U}: Tap target green creature.",
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [{ kind: "permanent", filter: { colors: ["G"], type: "creature" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{U}: Tap target green creature.",
    },
  ],
});

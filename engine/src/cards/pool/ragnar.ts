import { defineCard } from "../define.js";

export default defineCard({
  name: "Ragnar",
  manaCost: "{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "{G}{W}{U}, {T}: Regenerate target creature.",
  activated: [
    {
      cost: { mana: "{G}{W}{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{G}{W}{U}, {T}: Regenerate target creature.",
    },
  ],
});

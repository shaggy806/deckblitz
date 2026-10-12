import { defineCard } from "../define.js";

export default defineCard({
  name: "Kei Takahashi",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "{T}: Prevent the next 2 damage that would be dealt to target creature this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: "{T}: Prevent the next 2 damage that would be dealt to target creature this turn.",
    },
  ],
});

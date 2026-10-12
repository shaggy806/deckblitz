import { defineCard } from "../define.js";

export default defineCard({
  name: "Field Surgeon",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "Tap an untapped creature you control: Prevent the next 1 damage that would be dealt to target creature this turn.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "Tap an untapped creature you control: Prevent the next 1 damage that would be dealt to target creature this turn.",
    },
  ],
});

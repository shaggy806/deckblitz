import { defineCard } from "../define.js";

export default defineCard({
  name: "Master Apothecary",
  manaCost: "{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "Tap an untapped Cleric you control: Prevent the next 2 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { subtype: "Cleric", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: "Tap an untapped Cleric you control: Prevent the next 2 damage that would be dealt to any target this turn.",
    },
  ],
});

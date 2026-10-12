import { defineCard } from "../define.js";

export default defineCard({
  name: "Orim, Samite Healer",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: "{T}: Prevent the next 3 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 3 },
      resolve: null,
      text: "{T}: Prevent the next 3 damage that would be dealt to any target this turn.",
    },
  ],
});

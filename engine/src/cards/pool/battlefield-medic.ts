import { defineCard } from "../define.js";

// Ruling: X is counted as the ability resolves, not when the damage comes.
export default defineCard({
  name: "Battlefield Medic",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{T}: Prevent the next X damage that would be dealt to target creature this turn, where X is the number of Clerics on the battlefield.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: { countOf: { subtype: "Cleric" } } },
      resolve: null,
      text: "{T}: Prevent the next X damage that would be dealt to target creature this turn, where X is the number of Clerics on the battlefield.",
    },
  ],
});

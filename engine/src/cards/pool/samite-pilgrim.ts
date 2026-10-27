import { defineCard } from "../define.js";

const TEXT =
  "Domain — {T}: Prevent the next X damage that would be dealt to target creature this turn, where X is the number of basic land types among lands you control.";

export default defineCard({
  name: "Samite Pilgrim",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: { basicLandTypes: "you" } },
      resolve: null,
      text: TEXT,
    },
  ],
});

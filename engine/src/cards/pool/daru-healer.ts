import { defineCard } from "../define.js";

export default defineCard({
  name: "Daru Healer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  morph: { keyword: "morph", cost: "{W}" },
  text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.\nMorph {W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
  ],
});

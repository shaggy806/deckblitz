import { defineCard } from "../define.js";

export default defineCard({
  name: "Gravel Slinger",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 3,
  morph: { keyword: "morph", cost: "{1}{W}" },
  text: "{T}: This creature deals 1 damage to target attacking or blocking creature.\nMorph {1}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to target attacking or blocking creature.",
    },
  ],
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Whipcorder",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Rebel"],
  power: 2,
  toughness: 2,
  morph: { keyword: "morph", cost: "{W}" },
  text: "{W}, {T}: Tap target creature.\nMorph {W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{W}, {T}: Tap target creature.",
    },
  ],
});

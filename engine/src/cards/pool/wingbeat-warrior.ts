import { defineCard } from "../define.js";

export default defineCard({
  name: "Wingbeat Warrior",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{2}{W}" },
  text: "Flying\nMorph {2}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, target creature gains first strike until end of turn.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: "When this creature is turned face up, target creature gains first strike until end of turn.",
    },
  ],
});

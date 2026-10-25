import { defineCard } from "../define.js";

// EDHREC rank 24389. Experiment Twelve's trigger: "this creature or another
// creature you control" is `you-control`, a creature as it turns face up.

export default defineCard({
  name: "Pine Walker",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 5,
  morph: { keyword: "morph", cost: "{4}{G}" },
  text: "Morph {4}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhenever this creature or another creature you control is turned face up, untap that creature.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "untap", target: "trigger-object" },
      resolve: null,
      text: "Whenever this creature or another creature you control is turned face up, untap that creature.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 29346.

export default defineCard({
  name: "Slipstream Serpent",
  manaCost: "{7}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 6,
  toughness: 6,
  morph: { keyword: "morph", cost: "{5}{U}" },
  text: "This creature can't attack unless defending player controls an Island.\nWhen you control no Islands, sacrifice this creature.\nMorph {5}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "not", of: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you control no Islands, sacrifice this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { subtype: "Island" } },
      text: "This creature can't attack unless defending player controls an Island.",
    },
  ],
});

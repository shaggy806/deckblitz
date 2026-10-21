import { defineCard } from "../define.js";

// EDHREC rank 3914.

export default defineCard({
  name: "Roil Elemental",
  manaCost: "{3}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nLandfall — Whenever a land you control enters, you may gain control of target creature for as long as you control this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Gain control of the target creature for as long as you control Roil Elemental?",
        effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, you may gain control of target creature for as long as you control this creature.",
    },
  ],
});

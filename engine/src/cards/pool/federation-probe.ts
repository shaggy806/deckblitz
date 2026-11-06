import { defineCard } from "../define.js";

// EDHREC rank 28072.

const ENTER_TEXT = "When this creature enters, choose one —";

export default defineCard({
  name: "Federation Probe",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n• Target creature gets +1/+1 until end of turn.\n• Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Target creature gets +1/+1 until end of turn.",
            targets: ["creature"],
            effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          },
          { text: "Surveil 1.", effect: { kind: "surveil", amount: 1 } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

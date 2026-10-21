import { defineCard } from "../define.js";

// EDHREC rank 16337. The pump counts Elementals as it resolves, itself
// included, and doesn't change after (the rulings).

const LORD_TEXT = "Other Elementals you control get +1/+0.";
const PUMP_TEXT = "{2}{R}{G}: This creature gets +1/+1 until end of turn for each Elemental you control.";
const ELEMENTALS = { countOf: { subtype: "Elemental", controlledBy: "you" } } as const;

export default defineCard({
  name: "Creeping Trailblazer",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: `${LORD_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Elemental", excludeSelf: true },
      grantPt: [1, 0],
      text: LORD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: ELEMENTALS, toughness: ELEMENTALS, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});

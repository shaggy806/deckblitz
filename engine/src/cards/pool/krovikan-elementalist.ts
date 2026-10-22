import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 32253.
//
// "Sacrifice it" is the ability's controller's sacrifice: one someone else
// controls by the end step stays (rule 701.21a — `sacrifice-target`).

const PUMP_TEXT = "{2}{R}: Target creature gets +1/+0 until end of turn.";
const FLY_TEXT =
  "{U}{U}: Target creature you control gains flying until end of turn. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Krovikan Elementalist",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${PUMP_TEXT}\n${FLY_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      cost: { mana: "{U}{U}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            text: "Sacrifice it at the beginning of the next end step.",
            effect: { kind: "sacrifice-target", target: 0 },
          },
        ],
      },
      resolve: null,
      text: FLY_TEXT,
    },
  ],
});

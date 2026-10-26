import { defineCard } from "../define.js";

export default defineCard({
  name: "Tormentor Exarch",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, choose one —\n• Target creature gets +2/+0 until end of turn.\n• Target creature gets -0/-2 until end of turn.",
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
            text: "Target creature gets +2/+0 until end of turn.",
            targets: ["creature"],
            effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          },
          {
            text: "Target creature gets -0/-2 until end of turn.",
            targets: ["creature"],
            effect: { kind: "modify-pt", target: 0, power: 0, toughness: -2, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});

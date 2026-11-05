import { defineCard } from "../define.js";


export default defineCard({
  name: "Twisted Reflection",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "{B}", keyword: "entwine" },
  text: "Choose one —\n• Target creature gets -6/-0 until end of turn.\n• Switch target creature's power and toughness until end of turn.\nEntwine {B} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target creature gets -6/-0 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -6, toughness: 0, duration: "end-of-turn" },
      },
      {
        text: "Switch target creature's power and toughness until end of turn.",
        targets: ["creature"],
        effect: { kind: "switch-pt", target: 0, duration: "end-of-turn" },
      },
    ],
    kickedModes: 2,
  },
});

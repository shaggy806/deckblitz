import { defineCard } from "../define.js";

// EDHREC rank 14555. Fatestitcher's tap-or-untap, on another creature.

export default defineCard({
  name: "Tideforce Elemental",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 1,
  text: "{U}, {T}: You may tap or untap another target creature.\nLandfall — Whenever a land you control enters, you may untap this creature.",
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: "{U}, {T}: You may tap or untap another target creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap Tideforce Elemental?",
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, you may untap this creature.",
    },
  ],
});

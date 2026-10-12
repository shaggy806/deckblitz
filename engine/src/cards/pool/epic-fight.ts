import { defineCard } from "../define.js";

// EDHREC rank 10138. Winterflame's "one or both"; Okaun's doubling of both
// power and toughness, each read as the mode resolves; Go Nuts!'s fight.
// Both chosen, the doubling resolves first, so the doubled creature fights.
export default defineCard({
  name: "Epic Fight",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Choose one or both —\n• Double target creature's power and toughness until end of turn.\n• Target creature you control fights target creature an opponent controls.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Double target creature's power and toughness until end of turn.",
        targets: ["creature"],
        effect: {
          kind: "modify-pt",
          target: 0,
          power: { powerOf: 0, doubling: true },
          toughness: { toughnessOf: 0, doubling: true },
          duration: "end-of-turn",
        },
      },
      {
        text: "Target creature you control fights target creature an opponent controls.",
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: { kind: "fight", a: 0, b: 1 },
      },
    ],
  },
});

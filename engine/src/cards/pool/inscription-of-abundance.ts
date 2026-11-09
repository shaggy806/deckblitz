import { defineCard } from "../define.js";

export default defineCard({
  name: "Inscription of Abundance",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Kicker {2}{G}\nChoose one. If this spell was kicked, choose any number instead.\n• Put two +1/+1 counters on target creature.\n• Target player gains X life, where X is the greatest power among creatures they control.\n• Target creature you control fights target creature you don't control.",
  kicker: { cost: "{2}{G}" },
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: { min: 0, max: 3 },
    modes: [
      {
        text: "Put two +1/+1 counters on target creature.",
        targets: ["creature"],
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      {
        text: "Target player gains X life, where X is the greatest power among creatures they control.",
        targets: ["player"],
        effect: {
          kind: "gain-life",
          who: { target: 0 },
          amount: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" }, forTarget: 0 },
        },
      },
      {
        text: "Target creature you control fights target creature you don't control.",
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: { kind: "fight", a: 0, b: 1 },
      },
    ],
  },
});

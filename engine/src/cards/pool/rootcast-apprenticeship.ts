import { defineCard } from "../define.js";

const COUNTERS = "Put two +1/+1 counters on target creature.";
const COPY = "Create a token that's a copy of target token you control.";
const SQUIRREL = "Target player creates a 1/1 green Squirrel creature token.";
const SACRIFICE = "Target opponent sacrifices a nontoken artifact of their choice.";

export default defineCard({
  name: "Rootcast Apprenticeship",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Choose three. You may choose the same mode more than once.\n• ${COUNTERS}\n• ${COPY}\n• ${SQUIRREL}\n• ${SACRIFICE}`,
  targets: [],
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      {
        text: COUNTERS,
        targets: ["creature"],
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      {
        text: COPY,
        targets: [{ kind: "permanent", whose: "you", filter: { token: true } }],
        effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
      },
      {
        text: SQUIRREL,
        targets: ["player"],
        effect: { kind: "create-token", token: "Squirrel Token", count: 1, who: "target-controller" },
      },
      {
        text: SACRIFICE,
        targets: ["opponent"],
        effect: { kind: "sacrifice", who: "target", filter: { type: "artifact", token: false }, count: 1 },
      },
    ],
  },
});

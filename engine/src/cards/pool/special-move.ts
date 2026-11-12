import { defineCard } from "../define.js";

// EDHREC rank 10246. "Choose two" — exactly two modes. Foot Toss is Burn
// Together's shape; Dash Attack's creature is "attacking or blocking", yours.

const JUMP = "Jump Kick — Destroy target artifact.";
const DASH = "Dash Attack — Put two +1/+1 counters on target attacking or blocking creature you control.";
const FOOT =
  "Foot Toss — Target creature you control deals damage equal to its power to any other target. Then sacrifice it.";

export default defineCard({
  name: "Special Move",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose two —\n• ${JUMP}\n• ${DASH}\n• ${FOOT}`,
  targets: [],
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      { text: JUMP, targets: ["artifact"], effect: { kind: "destroy", target: 0 } },
      {
        text: DASH,
        targets: [
          {
            kind: "permanent",
            whose: "you",
            filter: { type: "creature", anyOf: [{ attacking: true }, { blocking: true }] },
          },
        ],
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      {
        text: FOOT,
        targets: ["creature-you-control", { kind: "other", of: "any-target", than: { slots: [0] } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: { powerOf: 0 }, target: 1, from: 0 },
            { kind: "sacrifice-target", target: 0 },
          ],
        },
      },
    ],
  },
});

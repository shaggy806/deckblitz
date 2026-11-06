import { defineCard } from "../define.js";

// EDHREC rank 27041.

export default defineCard({
  name: "Set Phasers to . . .",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Stun — Tap target creature and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)\n• Kill — This spell deals 3 damage to target attacking creature.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Stun — Tap target creature and put a stun counter on it.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: 0 },
            { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          ],
        },
      },
      {
        text: "Kill — This spell deals 3 damage to target attacking creature.",
        targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 20941.

// The mode is chosen as the trigger goes on the stack (`announced`), each
// with its own target. "That was dealt damage this turn" is any damage from
// any source (`damagedThisTurnBy: {}` — Unsparing Boltcaster's filter).
export default defineCard({
  name: "Downwind Ambusher",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skunk", "Assassin"],
  power: 4,
  toughness: 2,
  keywords: ["flash"],
  text: "Flash\nWhen this creature enters, choose one —\n• Target creature an opponent controls gets -1/-1 until end of turn.\n• Destroy target creature an opponent controls that was dealt damage this turn.",
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
            text: "Target creature an opponent controls gets -1/-1 until end of turn.",
            targets: ["creature-an-opponent-controls"],
            effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
          },
          {
            text: "Destroy target creature an opponent controls that was dealt damage this turn.",
            targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", damagedThisTurnBy: {} } }],
            effect: { kind: "destroy", target: 0 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 27797.
// Every mode targets, so the mode is chosen as it's cast (`castModal`); each
// mode's two targets are destroyed together.

export default defineCard({
  name: "Reign of Chaos",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one —\n• Destroy target Plains and target white creature.\n• Destroy target Island and target blue creature.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target Plains and target white creature.",
        targets: [
          { kind: "permanent", filter: { subtype: "Plains" } },
          { kind: "permanent", filter: { type: "creature", colors: ["W"] } },
        ],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "destroy", target: 1 },
          ],
        },
      },
      {
        text: "Destroy target Island and target blue creature.",
        targets: [
          { kind: "permanent", filter: { subtype: "Island" } },
          { kind: "permanent", filter: { type: "creature", colors: ["U"] } },
        ],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "destroy", target: 1 },
          ],
        },
      },
    ],
  },
});

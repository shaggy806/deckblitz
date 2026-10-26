import { defineCard } from "../define.js";

// EDHREC rank 19808.
//
// Rulings:
//   An artifact spell exists only on the stack; an artifact only on the
//     battlefield.

export default defineCard({
  name: "Steel Sabotage",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Counter target artifact spell.\n• Return target artifact to its owner's hand.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target artifact spell.",
        targets: [{ kind: "spell", filter: { type: "artifact" } }],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "Return target artifact to its owner's hand.",
        targets: ["artifact"],
        effect: { kind: "return-to-hand", target: 0 },
      },
    ],
  },
});

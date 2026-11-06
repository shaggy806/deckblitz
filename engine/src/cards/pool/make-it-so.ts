import { defineCard } from "../define.js";

// EDHREC rank 29661.

export default defineCard({
  name: "Make It So",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose one —\n• Untap target permanent you control. Target player draws two cards.\n• Create a 1/1 red Officer creature token and draw two cards.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Untap target permanent you control. Target player draws two cards.",
        targets: [{ kind: "permanent", whose: "you", filter: {} }, "player"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: 0 },
            { kind: "draw", amount: 2, target: 1 },
          ],
        },
      },
      {
        text: "Create a 1/1 red Officer creature token and draw two cards.",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Officer Token", count: 1 },
            { kind: "draw", amount: 2 },
          ],
        },
      },
    ],
  },
});

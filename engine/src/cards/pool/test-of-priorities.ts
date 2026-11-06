import { defineCard } from "../define.js";

// EDHREC rank 27502.

export default defineCard({
  name: "Test of Priorities",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Power to Engines — Surveil 2, then draw a card.\n• Power to Life Support — Exile target creature you control. Return that card to the battlefield under its owner's control at the beginning of the next end step.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Power to Engines — Surveil 2, then draw a card.",
        targets: [],
        effect: { kind: "surveil", amount: 2, then: { kind: "draw", amount: 1 } },
      },
      {
        text: "Power to Life Support — Exile target creature you control. Return that card to the battlefield under its owner's control at the beginning of the next end step.",
        targets: ["creature-you-control"],
        effect: {
          kind: "flicker",
          target: 0,
          returnAt: "next-end-step",
          returnText: "Return the exiled card to the battlefield under its owner's control.",
        },
      },
    ],
  },
});

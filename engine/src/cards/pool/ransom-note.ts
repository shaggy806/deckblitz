import { defineCard } from "../define.js";

// EDHREC rank 11381.

export default defineCard({
  name: "Ransom Note",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Clue"],
  text: "When this artifact enters, surveil 1.\n{2}, Sacrifice this artifact: Choose one —\n• Cloak the top card of your library.\n• Goad target creature.\n• Draw a card.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Cloak the top card of your library.", effect: { kind: "manifest", who: "you", cloak: true } },
          { text: "Goad target creature.", targets: ["creature"], effect: { kind: "goad", target: 0 } },
          { text: "Draw a card.", effect: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: "{2}, Sacrifice this artifact: Choose one —",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "When this artifact enters, surveil 1.",
    },
  ],
});

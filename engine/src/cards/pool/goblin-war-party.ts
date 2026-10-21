import { defineCard } from "../define.js";

// EDHREC rank 8060.
// Makes Goblin → use "Goblin Token".
//
// Rulings:
//   [2019-06-14] Goblin War Party’s second mode affects only creatures you control at the time the
//     spell resolves. Creatures you begin to control later in the turn won’t get +1/+1 or gain
//     haste.
//   [2019-06-14] If Goblin War Party is entwined, its modes are performed in order. The Goblin
//     tokens you create get +1/+1 and gain haste.

export default defineCard({
  name: "Goblin War Party",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  kicker: { cost: "{2}{R}", keyword: "entwine" },
  text: "Choose one —\n• Create three 1/1 red Goblin creature tokens.\n• Creatures you control get +1/+1 and gain haste until end of turn.\nEntwine {2}{R} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      { text: "Create three 1/1 red Goblin creature tokens.", effect: { kind: "create-token", token: "Goblin Token", count: 3 } },
      {
        text: "Creatures you control get +1/+1 and gain haste until end of turn.",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt-all",
              filter: { type: "creature", controlledBy: "you" },
              power: 1,
              toughness: 1,
              duration: "end-of-turn",
            },
            {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              keyword: "haste",
              duration: "end-of-turn",
            },
          ],
        },
      },
    ],
  },
});

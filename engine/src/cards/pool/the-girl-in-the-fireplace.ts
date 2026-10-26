import { defineCard } from "../define.js";

// EDHREC rank 13872.
// Makes Horse → new token "Horse Token (The Girl in the Fireplace)" (scaffolded).
// Makes Human Noble → new token "Human Noble Token" (scaffolded).
//
// Rulings:
//   [2023-10-13] To time travel, look at each permanent you control with a time counter on it and
//     each suspended card you own in exile with a time counter on it. For each of them, you choose
//     whether you want to put a time counter on that card or permanent, remove a time counter from
//     it, or do neither. Then those changes all happen simultaneously.
//   [2023-10-13] Time counters are usually found on cards with suspend and vanishing, but may be
//     found on other cards as well. Notably, Sagas use lore counters to track their progress, not
//     time counters. You can't move a Saga's chapters forward and backward this way.

export default defineCard({
  name: "The Girl in the Fireplace",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — Create a 1/1 white Human Noble creature token with vanishing 3 and \"Prevent all damage that would be dealt to this token.\"\nII — Create a 2/2 white Horse creature token with \"Doctors you control have horsemanship.\" (They can't be blocked except by creatures with horsemanship.)\nIII — Whenever a creature you control deals combat damage to a player this turn, time travel.",
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Human Noble Token", count: 1 },
      resolve: null,
      text: "I — Create a 1/1 white Human Noble creature token with vanishing 3 and \"Prevent all damage that would be dealt to this token.\"",
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Horse Token (The Girl in the Fireplace)", count: 1 },
      resolve: null,
      text: 'II — Create a 2/2 white Horse creature token with "Doctors you control have horsemanship."',
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } } },
        effect: { kind: "time-travel" },
        text: "Whenever a creature you control deals combat damage to a player this turn, time travel.",
      },
      resolve: null,
      text: "III — Whenever a creature you control deals combat damage to a player this turn, time travel.",
    },
  ],
});

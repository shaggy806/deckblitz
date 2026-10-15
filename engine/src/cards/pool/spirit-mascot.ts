import { defineCard } from "../define.js";

// EDHREC rank 19153.
//
// Hardened Academic's trigger: once per move, however many cards left your
// graveyard together (the ruling).
//
// Rulings:
//   [2026-03-20] If multiple cards leave your graveyard at the same time, Spirit Mascot's ability
//     will trigger only once.

export default defineCard({
  name: "Spirit Mascot",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Spirit", "Ox"],
  power: 2,
  toughness: 2,
  text: "Whenever one or more cards leave your graveyard, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever one or more cards leave your graveyard, put a +1/+1 counter on this creature.",
    },
  ],
});

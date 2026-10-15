import { defineCard } from "../define.js";

// EDHREC rank 20229.
//
// Rulings:
//   [2025-04-04] If multiple cards leave your graveyard at the same time, Attuned Hunter's last
//     ability will trigger only once.
//
// Kheru Goldkeeper's trigger: `leaves-graveyard` fires once per batch.
const LEAVE_TEXT =
  "Whenever one or more cards leave your graveyard during your turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Attuned Hunter",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      condition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});

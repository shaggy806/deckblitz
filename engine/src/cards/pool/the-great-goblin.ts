import { defineCard } from "../define.js";

// EDHREC rank 9176.
//
// Rulings:
//   [2026-06-29] You pay all costs and follow all timing rules for cards played this way. For
//     example, if the exiled card is a land card, you may play it only during your main phase
//     while the stack is empty and only if you have an available land play remaining.
//
// "Whenever you put one or more counters on a Goblin, Orc, or Army you
// control" is a `counters-put` trigger with `byYou` (Hapatra's): once per
// permanent per event, whatever kind of counter — amassing onto your Army
// fires it. The impulse is Riku of Many Paths' "until the end of your next
// turn".

const DAMAGE_TEXT =
  "Whenever you put one or more counters on a Goblin, Orc, or Army you control, The Great Goblin deals 2 damage to target opponent.";
const DIES_TEXT =
  "Whenever another Goblin, Orc, or Army you control dies, exile the top card of your library. You may play it until the end of your next turn.";

export default defineCard({
  name: "The Great Goblin",
  manaCost: "{1}{B/R}{B/R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Noble"],
  power: 3,
  toughness: 2,
  text: `${DAMAGE_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "counters-put",
        who: "you-control",
        filter: { subtypes: ["Goblin", "Orc", "Army"] },
        byYou: true,
      },
      targets: ["opponent"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtypes: ["Goblin", "Orc", "Army"] }, otherOnly: true },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

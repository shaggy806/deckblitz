import { defineCard } from "../define.js";

// EDHREC rank 17562.
//
// The Emperor of Palamecia's "at least four mana was spent" cast trigger; "it
// can't be blocked this turn" is Giant Koi's unblockable until end of turn,
// which only matters as blockers are declared — once blocked, it stays
// blocked (the ruling).
//
// Rulings:
//   [2025-06-06] Once Sahagin has been blocked, casting a noncreature spell in order to cause
//     Sahagin's ability to trigger won't cause Sahagin to become unblocked.
//   [2025-06-06] Sahagin's ability resolves before the spell that caused it to trigger. It resolves
//     even if that spell is countered or otherwise leaves the stack.

const CAST_TEXT =
  "Whenever you cast a noncreature spell, if at least four mana was spent to cast it, put a +1/+1 counter on this creature and it can't be blocked this turn.";

export default defineCard({
  name: "Sahagin",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Warrior"],
  power: 1,
  toughness: 3,
  text: CAST_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"], manaSpent: { op: "gte", n: 4 } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});

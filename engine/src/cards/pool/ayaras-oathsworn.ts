import { defineCard } from "../define.js";

// EDHREC rank 7366.
//
// Rulings:
//   [2023-05-12] If the triggered ability does trigger, that ability will check Ayara's Oathsworn
//     again as it tries to resolve. If Ayara's Oathsworn has four or more +1/+1 counters on it at
//     that time, the ability won't resolve. None of its effects will happen. You won't put a +1/+1
//     counter on Ayara's Oathsworn and you won't search for a card.
//   [2023-05-12] If Ayara's Oathsworn has four or more +1/+1 counters on it as it deals combat
//     damage to a player, its ability won't trigger at all. None of its effects will happen. You
//     won't put a +1/+1 counter on Ayara's Oathsworn and you won't search for a card.
//   [2023-05-12] If Ayara's Oathsworn isn't on the battlefield as its ability tries to resolve,
//     you won't search for a card, even if Ayara's Oathsworn had three +1/+1 counters on it before
//     if left the battlefield, because it won't be around to have the fourth +1/+1 counter put on
//     it.
//
// Runaway Steam-Kin's intervening-if (checked as it triggers and again as it resolves), then
// Treasure Map's "then if" re-read of the source's counters. A departed Oathsworn is read by its
// last-known counters, which the add-counter couldn't raise, so it never has exactly four then
// (the third ruling).

const COMBAT_TEXT =
  "Whenever this creature deals combat damage to a player, if it has fewer than four +1/+1 counters on it, put a +1/+1 counter on it. Then if it has exactly four +1/+1 counters on it, search your library for a card, put it into your hand, then shuffle.";

export default defineCard({
  name: "Ayara's Oathsworn",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "lt", n: 4 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 4 } },
            then: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});

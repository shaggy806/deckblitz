import { defineCard } from "../define.js";

// EDHREC rank 8809.
//
// Rulings:
//   [2010-03-01] If an ability (from Future Sight or Oracle of Mul Daya, for example) causes you
//     to play with the top card of your library revealed, you may still put a quest counter on
//     Quest for Ula’s Temple when the first ability resolves if the top card of your library is a
//     creature card.
//   [2010-03-01] When the first ability resolves, you may look at the top card of your library. If
//     you don’t, nothing happens. If you look at it and it’s not a creature card, it simply stays
//     hidden. If you look at it and it is a creature card, you may reveal it and put a quest
//     counter on Quest for Ula’s Temple, or you may choose to leave it hidden. In all cases, the
//     card remains on top of your library.
//   [2010-03-01] Although the first ability triggers only on your turn, the second ability may
//     trigger each turn.
//
// The upkeep look is a one-card look-and-choose: a creature card may be
// revealed ("chosen") and goes straight back on top, and the counter is the
// `then`, applied only when one was revealed. Looking is harmless to the
// player, so the "may look" isn't asked separately.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may look at the top card of your library. If it's a creature card, you may reveal it and put a quest counter on this enchantment.";
const END_TEXT =
  "At the beginning of each end step, if there are three or more quest counters on this enchantment, you may put a Kraken, Leviathan, Octopus, or Serpent creature card from your hand onto the battlefield.";

export default defineCard({
  name: "Quest for Ula's Temple",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "library-top",
        leftover: "stay",
        then: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 3 } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", subtypes: ["Kraken", "Leviathan", "Octopus", "Serpent"] },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});

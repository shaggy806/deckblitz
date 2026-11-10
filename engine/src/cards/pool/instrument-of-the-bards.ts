import { defineCard } from "../define.js";

// EDHREC rank 12239.
//
// The mana value sought is the number of harmony counters as the ability
// resolves (as the Instrument last existed, if it has left — rule 608.2h).
// "If that card is legendary" is the search's `then`, the revealed find its
// slot 0: no find, no Treasure.
const UPKEEP = "At the beginning of your upkeep, you may put a harmony counter on Instrument of the Bards.";
const SEARCH =
  "{3}{G}, {T}: Search your library for a creature card with mana value equal to the number of harmony counters on Instrument of the Bards, reveal it, and put it into your hand. If that card is legendary, create a Treasure token. Then shuffle.";

export default defineCard({
  name: "Instrument of the Bards",
  manaCost: "{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${UPKEEP}\n${SEARCH}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a harmony counter on Instrument of the Bards?",
        effect: { kind: "add-counter", target: "source", counter: "harmony", amount: 1 },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          type: "creature",
          manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "harmony" } } },
        },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { supertype: "legendary" } },
          then: { kind: "create-token", token: "Treasure Token", count: 1 },
        },
      },
      resolve: null,
      text: SEARCH,
    },
  ],
});

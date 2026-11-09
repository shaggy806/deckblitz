import { defineCard } from "../define.js";

// EDHREC rank 2343. Chosen first (nothing moves), the rest bottomed in a random
// order, then the card is put in: with three +1/+1 counters if its mana value,
// as a card in the library, is 3 or less (the ruling).

export default defineCard({
  name: "Turntimber Symbiosis",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top seven cards of your library. You may put a creature card from among them onto the battlefield. If that card has mana value 3 or less, it enters with three additional +1/+1 counters on it. Put the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 7,
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "stay",
    leftover: "bottom-random",
    then: {
      kind: "conditional",
      condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 3 } } },
      then: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "+1/+1", amount: 3 } },
      else: { kind: "put-onto-battlefield", target: 0 },
    },
  },
  faces: ["Turntimber Symbiosis", "Turntimber, Serpentine Wood"],
});

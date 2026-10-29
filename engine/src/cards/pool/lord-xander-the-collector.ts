import { defineCard } from "../define.js";

// EDHREC rank 7649.

export default defineCard({
  name: "Lord Xander, the Collector",
  manaCost: "{4}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Demon", "Noble"],
  power: 6,
  toughness: 6,
  text: "When Lord Xander enters, target opponent discards half the cards in their hand, rounded down.\nWhenever Lord Xander attacks, defending player mills half their library, rounded down.\nWhen Lord Xander dies, target opponent sacrifices half the nonland permanents they control of their choice, rounded down.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: { half: { cardsInHand: { target: 0 } }, round: "down" } },
      resolve: null,
      text: "When Lord Xander enters, target opponent discards half the cards in their hand, rounded down.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // The defending player is the attack trigger's player; "each" reads
      // the library of the player the mill acts on.
      effect: { kind: "mill", target: "trigger-player", amount: { half: { librarySize: "each" }, round: "down" } },
      resolve: null,
      text: "Whenever Lord Xander attacks, defending player mills half their library, rounded down.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sacrifice",
        who: "target",
        filter: { notTypes: ["land"] },
        count: { half: { countOf: { notTypes: ["land"], controlledBy: "you" }, forTarget: 0 }, round: "down" },
      },
      resolve: null,
      text: "When Lord Xander dies, target opponent sacrifices half the nonland permanents they control of their choice, rounded down.",
    },
  ],
});

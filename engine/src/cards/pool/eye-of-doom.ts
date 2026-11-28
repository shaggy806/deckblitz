import { defineCard } from "../define.js";

// EDHREC rank 23069. Commander 2013.
//
// Rulings:
//   [2013-10-17] The active player chooses a permanent first, followed by each other player in
//     turn order. Each player will know what previous players have chosen when making their own
//     choice. Then the doom counters are put on all the chosen permanents simultaneously.
//   [2013-10-17] None of the permanents are targeted. A player can choose a permanent with
//     protection from artifacts, for example.
//   [2013-10-17] If a permanent with a doom counter isn't destroyed by Eye of Doom's last ability
//     (perhaps because it has indestructible or it regenerated), the doom counter will remain on
//     that permanent.
//
// "Each player chooses" is a `vote` `choose` from the active player (rule 101.4); then each
// player puts a counter on the one they chose, all at once (`for-each-voted` `eachVote`, the
// chooser the one who puts it, so two who chose one permanent put two).

const TEXT =
  "When this artifact enters, each player chooses a nonland permanent and puts a doom counter on it.\n{2}, {T}, Sacrifice this artifact: Destroy each permanent with a doom counter on it.";

export default defineCard({
  name: "Eye of Doom",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            startingWith: "active-player",
            for: { permanent: { notTypes: ["land"] }, prompt: "Choose a nonland permanent to put a doom counter on" },
          },
          {
            kind: "for-each-voted",
            which: "voted",
            eachVote: true,
            simultaneous: true,
            effect: { kind: "add-counter", target: 0, counter: "doom", amount: 1, by: "that-player" },
          },
        ],
      },
      resolve: null,
      text: "When this artifact enters, each player chooses a nonland permanent and puts a doom counter on it.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { counters: { kind: "doom", compare: { op: "gte", n: 1 } } } },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: Destroy each permanent with a doom counter on it.",
    },
  ],
});

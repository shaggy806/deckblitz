import { defineCard } from "../define.js";

// EDHREC rank 6803.
// Makes Kor Ally → use "Kor Ally Token".
//
// Rulings:
//   [2016-01-22] Each of the Oaths is legendary: if you control more than one of any particular
//     Oath, you choose one to remain on the battlefield and the others are put into your
//     graveyard.
//   [2016-01-22] The “legend rule” checks the full names of legendary permanents. You can control
//     Oath of Gideon and Oath of Chandra at the same time, for example.
//   [2016-01-22] Even if you control a particular Oath, you can cast another of that Oath to take
//     advantage of its enters-the-battlefield ability. It will enter the battlefield, causing its
//     first ability to trigger. You will then choose one to keep, as detailed above, and then its
//     enters-the-battlefield ability will resolve.

export default defineCard({
  name: "Oath of Gideon",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: "When Oath of Gideon enters, create two 1/1 white Kor Ally creature tokens.\nEach planeswalker you control enters with an additional loyalty counter on it.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Kor Ally Token", count: 2 },
      resolve: null,
      text: "When Oath of Gideon enters, create two 1/1 white Kor Ally creature tokens.",
    },
  ],
  static: [
    {
      // On top of the loyalty it enters with (rule 306.5b) — both apply as
      // it enters. The Oath is no planeswalker, so "other" needn't be said.
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "planeswalker", controlledBy: "you" },
        counters: { kind: "loyalty", amount: 1 },
      },
      text: "Each planeswalker you control enters with an additional loyalty counter on it.",
    },
  ],
});

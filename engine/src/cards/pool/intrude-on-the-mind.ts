import { defineCard } from "../define.js";

// EDHREC rank 13894.
//
// Fact or Fiction turned round: you separate the revealed cards, and an
// opponent — which one is yours to choose, as it resolves, once the piles are
// made (the ruling; `"an-opponent"`) — chooses the pile for your hand. All
// five may go into one pile (the ruling; rule 700.3d). The Thopter is made
// 0/0 and gets a +1/+1 counter for each card the other pile put into your
// graveyard (`thisWay: "put-into-graveyard"`), all within the resolution, so
// it's never a 0/0 when state-based actions are checked. A card a
// replacement sent elsewhere (Rest in Peace) wasn't put into the graveyard.
//
// Rulings:
//   [2024-02-02] You may choose to put all of the cards into one pile and leave the other pile
//     empty. If you do, the opponent will choose whether to put the revealed cards into your hand
//     or your graveyard.
//   [2024-02-02] You decide which opponent chooses the pile while resolving Intrude on the Mind.

export default defineCard({
  name: "Intrude on the Mind",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Reveal the top five cards of your library and separate them into two piles. An opponent chooses one of those piles. Put that pile into your hand and the other into your graveyard. Create a 0/0 colorless Thopter artifact creature token with flying, then put a +1/+1 counter on it for each card put into your graveyard this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "separate-into-piles",
        objects: { libraryTop: 5, reveal: true },
        chooser: "an-opponent",
        chosen: "hand",
        rest: "graveyard",
      },
      {
        kind: "create-token",
        token: "Thopter Token (Intrude on the Mind)",
        count: 1,
        thenCounters: { kind: "+1/+1", amount: { thisWay: "put-into-graveyard", who: "you" } },
      },
    ],
  },
});

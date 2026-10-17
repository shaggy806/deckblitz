import { defineCard } from "../define.js";

// EDHREC rank 12680.
//
// A search for each Redhorn Pass vote (each one shuffles; with no such vote
// there's no search and no shuffle), then a card back for each Mines of
// Moria vote. Exiled as it resolves.

const TEXT =
  "Council's dilemma — Starting with you, each player votes for Redhorn Pass or Mines of Moria. For each Redhorn Pass vote, search your library for a basic land card and put it onto the battlefield tapped. If you search your library this way, shuffle. For each Mines of Moria vote, return a card from your graveyard to your hand.";

export default defineCard({
  name: "Travel Through Caradhras",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${TEXT}\nExile Travel Through Caradhras.`,
  targets: [],
  exileOnResolve: true,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { options: ["Redhorn Pass", "Mines of Moria"] } },
      {
        kind: "for-each-vote",
        option: 0,
        effect: {
          kind: "search-library",
          filter: { type: "land", supertype: "basic" },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
        },
      },
      {
        kind: "for-each-vote",
        option: 1,
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "stay",
        },
      },
    ],
  },
});

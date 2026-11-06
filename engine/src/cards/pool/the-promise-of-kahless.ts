import { defineCard } from "../define.js";

// EDHREC rank 31293.
//
// "All other" leaves out the card sacrificed this way, now in the graveyard
// (Bringer of the Last Gift's `notThisWay: "sacrificed"`).

export default defineCard({
  name: "The Promise of Kahless",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "You may sacrifice a Klingon or Warrior. If you do, return all other Klingon and Warrior creature cards from " +
    "your graveyard to the battlefield.",
  targets: [],
  effect: {
    kind: "each-player-may",
    who: "you",
    options: [{ sacrifice: { subtypes: ["Klingon", "Warrior"] }, text: "Sacrifice a Klingon or Warrior" }],
    ifDid: {
      kind: "return-from-graveyard",
      filter: { type: "creature", subtypes: ["Klingon", "Warrior"], notThisWay: "sacrificed" },
      destination: "battlefield",
      count: "all",
    },
  },
});

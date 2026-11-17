import { defineCard } from "../define.js";

// EDHREC rank 12217.
//
// Rulings: all of your votes are cast at the same time, so players voting
// after you know them all (rule 701.38d); two Representatives are cumulative
// (each instance one more vote); only spells and abilities that use the word
// "vote" are affected (701.38c — `choose` votes get no additional ones).
// Unlike Ballot Broker's, the additional vote isn't optional
// (`getsAdditionalVote`).

const TEXT = "While voting, you get an additional vote.";

export default defineCard({
  name: "Brago's Representative",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 4,
  text: `${TEXT} (The votes can be for different choices or for the same choice.)`,
  static: [{ affects: { scope: "self" }, getsAdditionalVote: true, text: TEXT }],
});

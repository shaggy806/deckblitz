import { defineCard } from "../define.js";

// EDHREC rank 11978.
//
// Rulings:
//   [2016-08-23] You must make your initial vote, even if you decline to vote an additional time.
//   [2016-08-23] Ballot Broker's ability is cumulative. If you control two of them, you can vote up
//     to three times.
//
// Tivit, Seller of Secrets' static (rule 701.38d): each instance is one more
// optional vote, so two Brokers stack.

const TEXT = "While voting, you may vote an additional time.";

export default defineCard({
  name: "Ballot Broker",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 3,
  text: `${TEXT} (The votes can be for different choices or for the same choice.)`,
  static: [{ affects: { scope: "self" }, votesAdditionalTime: true, text: TEXT }],
});

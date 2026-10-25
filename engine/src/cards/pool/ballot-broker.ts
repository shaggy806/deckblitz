import { defineCard } from "../define.js";

// Rulings: the initial vote is mandatory, the additional one optional; two
// Ballot Brokers are cumulative (rule 701.38d — `votesAdditionalTime`, each
// instance one more vote).

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

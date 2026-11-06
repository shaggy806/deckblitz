import { defineCard } from "../define.js";

// EDHREC rank 28255.

export default defineCard({
  name: "Deanna Troi, Psychic Counsel",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Betazoid", "Human", "Advisor"],
  power: 2,
  toughness: 2,
  text: "Other creatures you control enter with an additional +1/+1 counter on them.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text: "Other creatures you control enter with an additional +1/+1 counter on them.",
    },
  ],
});

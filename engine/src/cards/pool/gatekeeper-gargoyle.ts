import { defineCard } from "../define.js";

// EDHREC rank 18034.
//
// The count is read as it enters, never counting anything entering
// alongside it (an enters replacement's amount).
const TEXT = "This creature enters with a +1/+1 counter on it for each Gate you control.";

export default defineCard({
  name: "Gatekeeper Gargoyle",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countOf: { subtype: "Gate", controlledBy: "you" } } },
      },
      text: TEXT,
    },
  ],
});

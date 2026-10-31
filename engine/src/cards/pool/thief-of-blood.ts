import { defineCard } from "../define.js";

// One replacement (rule 614.1c): as it enters, every counter comes off every
// other permanent, and it enters with a +1/+1 counter for each.
export default defineCard({
  name: "Thief of Blood",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nAs this creature enters, remove all counters from all permanents. This creature enters with a +1/+1 counter on it for each counter removed this way.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        removeAllCountersFrom: {},
        counters: { kind: "+1/+1", amount: "removed-as-enters" },
      },
      text: "As this creature enters, remove all counters from all permanents. This creature enters with a +1/+1 counter on it for each counter removed this way.",
    },
  ],
});

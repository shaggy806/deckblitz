import { defineCard } from "../define.js";

// EDHREC rank 23485.

const COUNTER_TEXT = "{1}{G}, {T}: Put a +1/+1 counter on Big Bertha.";

export default defineCard({
  name: "Big Bertha",
  manaCost: "{X}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 1,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance\nBig Bertha enters with X +1/+1 counters on her.\n${COUNTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "Big Bertha enters with X +1/+1 counters on her.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});

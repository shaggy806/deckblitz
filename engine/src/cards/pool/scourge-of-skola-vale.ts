import { defineCard } from "../define.js";

// EDHREC rank 15478.

const SAC_TEXT =
  "{T}, Sacrifice another creature: Put a number of +1/+1 counters on this creature equal to the sacrificed creature's toughness.";

export default defineCard({
  name: "Scourge of Skola Vale",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\nThis creature enters with two +1/+1 counters on it.\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      // The sacrificed creature's toughness as it last existed (ruling).
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { toughnessOf: "sacrificed" } },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
  ],
});

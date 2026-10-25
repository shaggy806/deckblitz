import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 19668.

export default defineCard({
  name: "Undergrowth Scavenger",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Horror"],
  power: 0,
  toughness: 0,
  text: "This creature enters with a number of +1/+1 counters on it equal to the number of creature cards in all graveyards.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countInGraveyard: { type: "creature" } } },
      },
      text: "This creature enters with a number of +1/+1 counters on it equal to the number of creature cards in all graveyards.",
    },
  ],
});

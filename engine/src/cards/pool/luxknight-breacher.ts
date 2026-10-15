import { defineCard } from "../define.js";

// EDHREC rank 13770.
//
// The count is read as it enters, never counting itself or anything entering
// with it (the ruling; `enteringCounterAmount`).

const ENTER_TEXT =
  "This creature enters with a +1/+1 counter on it for each other creature and/or artifact you control.";

export default defineCard({
  name: "Luxknight Breacher",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: ENTER_TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { countOf: { typesAnyOf: ["creature", "artifact"], controlledBy: "you" } },
        },
      },
      text: ENTER_TEXT,
    },
  ],
});

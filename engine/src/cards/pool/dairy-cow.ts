import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). "Grazing type" is its reminder text: an
// enters-with-counters replacement (rule 614.1c), five milk counters per
// Forest or Plant (either subtype, counted once) its controller controls as
// it enters. Milk counters do nothing (the ruling).

const TEXT =
  "Grazing type (This creature enters the battlefield with five milk counters on it for each Forest and/or Plant you control.)";

export default defineCard({
  name: "Dairy Cow",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cow"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "milk",
          amount: { product: [5, { countOf: { subtypes: ["Forest", "Plant"], controlledBy: "you" } }] },
        },
      },
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 21632. "In addition to its other colors and types", with no
// duration.
const TEXT =
  "{3}, Discard a card: Put three +1/+1 counters on this creature and it becomes a black Demon in addition to its other colors and types. Activate only once.";

export default defineCard({
  name: "Possessed Goat",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Goat"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
          { kind: "become", target: "source", addSubtypes: ["Demon"], addColors: ["B"], duration: "permanent" },
        ],
      },
      resolve: null,
      onlyOnce: true,
      text: TEXT,
    },
  ],
});

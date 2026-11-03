import { defineCard } from "../define.js";

const FILL_TEXT = "{3}, {T}: Put an elixir counter on this artifact.";
const DRINK_TEXT = "{T}, Remove all elixir counters from this artifact: You gain 2 life for each elixir counter removed this way.";

export default defineCard({
  name: "Essence Bottle",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${FILL_TEXT}\n${DRINK_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "elixir", amount: 1 },
      resolve: null,
      text: FILL_TEXT,
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "elixir", count: "all" } },
      targets: [],
      effect: { kind: "gain-life", amount: { product: ["x", 2] } },
      resolve: null,
      text: DRINK_TEXT,
    },
  ],
});

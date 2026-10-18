import { defineCard } from "../define.js";

// EDHREC rank 12323.
//
// Rulings:
//   [2023-02-04] Removing an oil counter is part of the cost to activate Serum Sovereign's last
//     ability. Players can't respond with a spell or ability that removes counters to prevent you
//     from drawing a card and scrying 2.

export default defineCard({
  name: "Serum Sovereign",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever you cast a noncreature spell, put an oil counter on this creature.\n{U}, Remove an oil counter from this creature: Draw a card, then scry 2.",
  activated: [
    {
      cost: { mana: "{U}", tap: false, removeCounter: { kind: "oil", count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "scry", amount: 2 },
        ],
      },
      resolve: null,
      text: "{U}, Remove an oil counter from this creature: Draw a card, then scry 2.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: "Whenever you cast a noncreature spell, put an oil counter on this creature.",
    },
  ],
});

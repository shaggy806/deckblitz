import { defineCard } from "../define.js";

// EDHREC rank 16609. "The attacking player" is the active player (Two-Headed
// Giant isn't played here). The point check is only at this ability's
// resolution, however counters got there (its ruling).
export default defineCard({
  name: "Contested Game Ball",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "Whenever you're dealt combat damage, the attacking player gains control of this artifact and untaps it.\n{2}, {T}: Draw a card and put a point counter on this artifact. Then if it has five or more point counters on it, sacrifice it and create a Treasure token.",
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "you", combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: "source", who: "active-player", untilEndOfTurn: false },
          { kind: "untap", target: "source", by: "active-player" },
        ],
      },
      resolve: null,
      text: "Whenever you're dealt combat damage, the attacking player gains control of this artifact and untaps it.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "add-counter", target: "source", counter: "point", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "point", compare: { op: "gte", n: 5 } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice-source" },
                { kind: "create-token", token: "Treasure Token", count: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "{2}, {T}: Draw a card and put a point counter on this artifact. Then if it has five or more point counters on it, sacrifice it and create a Treasure token.",
    },
  ],
});

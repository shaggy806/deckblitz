import { defineCard } from "../define.js";

// EDHREC rank 28911.

const TEXT =
  "Landfall — Whenever a land you control enters, put a quest counter on this enchantment. Then exile cards from the top of your library until you exile a nonland card. You may play that card this turn. If this enchantment has five or more quest counters on it, add {R}{R}.";

// The other exiled cards stay in exile. The quest-counter check is read as
// the ability resolves, after this resolution's counter.
export default defineCard({
  name: "Exploratory Mission",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
          {
            kind: "reveal-until",
            filter: { notTypes: ["land"] },
            exile: true,
            then: { kind: "grant-play", cards: 0, duration: "end-of-turn", play: true },
            rest: "stay",
          },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 5 } },
            then: { kind: "add-mana", mana: "R", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

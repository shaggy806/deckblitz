import { defineCard } from "../define.js";

// A mana ability (rule 605.1a) that sets up a delayed trigger as part of it
// (`add-mana`'s `also`, as Yuna, Grand Summoner's): when its controller next
// casts an artifact spell this turn, that spell gains sunburst (rule
// 702.44a) — `enters-with-counters`' `"sunburst"`, a counter for each color
// of mana spent to cast it, +1/+1 counters if it enters as a creature, else
// charge counters.

const TEXT =
  "{T}: Add one mana of any color. When you next cast an artifact spell this turn, that spell gains sunburst. (If it's a creature, it enters with a +1/+1 counter on it for each color of mana spent to cast it. Otherwise, it enters with that many charge counters on it.)";

export default defineCard({
  name: "Solar Array",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: {
          kind: "delayed-trigger",
          at: { nextSpell: { type: "artifact" } },
          effect: { kind: "enters-with-counters", target: "trigger-object", counter: "sunburst", amount: 0 },
          text: "That spell gains sunburst.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 12803. Amonkhet. "If no counters were removed this way" asks
// whether it's still here with a flood counter: gone from the battlefield, it
// can't have any removed, so it draws (the ruling) — `source-on-battlefield`
// keeps `self-counters` from reading the counters it left with. However many
// flood counters it had, the mana is {C}{G}{U} once (the other ruling).
const TEXT =
  "At the beginning of your first main phase, remove all flood counters from this enchantment. If no counters were removed this way, put a flood counter on this enchantment and draw a card. Otherwise, add {C}{G}{U}.";

export default defineCard({
  name: "Bounty of the Luxa",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "flood", compare: { op: "gte", n: 1 } },
          ],
        },
        then: {
          kind: "sequence",
          effects: [
            { kind: "remove-counter", target: "source", counter: "flood", amount: { countersOn: "source", counter: "flood" } },
            { kind: "add-mana", mana: "C", amount: 1 },
            { kind: "add-mana", mana: "G", amount: 1 },
            { kind: "add-mana", mana: "U", amount: 1 },
          ],
        },
        else: {
          kind: "sequence",
          effects: [
            {
              kind: "conditional",
              condition: { kind: "source-on-battlefield" },
              then: { kind: "add-counter", target: "source", counter: "flood", amount: 1 },
            },
            { kind: "draw", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

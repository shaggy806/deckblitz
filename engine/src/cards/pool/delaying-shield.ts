import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 14900.
//
// Rulings:
//   Note that the damage is replaced and is not "prevented". This means it can replace damage
//     that "can't be prevented".
//
// The damage becomes the counters (`instead: { effect }`, rule 614.6): no damage is dealt, and
// none is prevented, so damage that can't be prevented is replaced all the same (615.12 binds
// only prevention). The upkeep removes every delay counter, then asks once per counter removed
// (`repeat` `times` the counters this resolution took off) whether to pay {1}{W} or lose 1 life.
const REPLACE = "If damage would be dealt to you, put that many delay counters on this enchantment instead.";
const UPKEEP =
  "At the beginning of your upkeep, remove all delay counters from this enchantment. For each delay counter removed this way, you lose 1 life unless you pay {1}{W}.";

export default defineCard({
  name: "Delaying Shield",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${REPLACE}\n${UPKEEP}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "you",
        instead: { effect: { kind: "add-counter", target: "source", counter: "delay", amount: "x" } },
      },
      text: REPLACE,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "source", counter: "delay", amount: "all" },
          {
            kind: "repeat",
            times: { thisWay: "counters-removed" },
            effect: {
              kind: "unless",
              chooser: "you",
              options: [{ pay: "{1}{W}", text: "Pay {1}{W}" }],
              otherwise: { kind: "lose-life", amount: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});

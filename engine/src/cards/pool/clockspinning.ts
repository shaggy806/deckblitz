import { defineCard } from "../define.js";
import { CHOSEN_COUNTER } from "../../effects.js";

// Which kind of counter, and whether to add or remove one, are both chosen as it
// resolves (the ruling); with no counter on the target, nothing happens.
export default defineCard({
  name: "Clockspinning",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nChoose a counter on target permanent or suspended card. Remove that counter from that permanent or card or put another of those counters on it.",
  targets: [{ kind: "one-of", of: ["permanent", { kind: "card-in-exile", filter: { suspended: true } }] }],
  effect: {
    kind: "choose-value",
    value: "counter-kind",
    on: 0,
    then: {
      kind: "modal",
      minModes: 1,
      maxModes: 1,
      modes: [
        { text: "Remove that counter", effect: { kind: "remove-counter", target: 0, counter: CHOSEN_COUNTER, amount: 1 } },
        { text: "Put another of those counters on it", effect: { kind: "add-counter", target: 0, counter: CHOSEN_COUNTER, amount: 1 } },
      ],
    },
  },
});

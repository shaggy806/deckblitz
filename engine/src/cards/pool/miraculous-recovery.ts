import { defineCard } from "../define.js";

// Rulings:
//   The creature returns to the battlefield without a +1/+1 counter on it. Any abilities that
//     trigger when a creature enters the battlefield will trigger or not as appropriate before it
//     receives the +1/+1 counter and resolve after it has received that counter.
//   No player may take actions between the time the creature returns to the battlefield and the
//     time you put a +1/+1 counter on it.
//
// So the counter is a second step (Okiba Salvage's shape), not `withCounters`
// — it doesn't enter with it.

export default defineCard({
  name: "Miraculous Recovery",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Return target creature card from your graveyard to the battlefield. Put a +1/+1 counter on it.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 14189. Font of Progress's mill: the charge counters are read as
// the ability resolves — as the artifact last existed if it's gone (the
// ruling).
export default defineCard({
  name: "Grindclock",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Put a charge counter on this artifact.\n{T}: Target player mills X cards, where X is the number of charge counters on this artifact.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{T}: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: { countersOn: "source", counter: "charge" } },
      resolve: null,
      text: "{T}: Target player mills X cards, where X is the number of charge counters on this artifact.",
    },
  ],
});

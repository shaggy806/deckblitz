import { defineCard } from "../define.js";

// EDHREC rank 11172.
// The second target shares the first's controller, rechecked as it resolves: creatures under
// different controllers by then leave the second illegal and nothing moves (the ruling). How many
// counters move is chosen as it resolves.

export default defineCard({
  name: "Bioshift",
  manaCost: "{G/U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Move any number of +1/+1 counters from target creature onto another target creature with the same controller.",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 }, sameController: true }],
  effect: { kind: "move-counters", from: 0, to: 1, counter: "+1/+1", amount: "any" },
});

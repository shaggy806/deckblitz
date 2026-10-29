import { defineCard } from "../define.js";

// EDHREC rank 30222.
//
// "Up to four": how many is chosen as it resolves (the `remove-counters`
// decision), none included.

export default defineCard({
  name: "Gremlin Mine",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{1}, {T}, Sacrifice this artifact: It deals 4 damage to target artifact creature.\n{1}, {T}, Sacrifice this artifact: Remove up to four charge counters from target noncreature artifact.",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "{1}, {T}, Sacrifice this artifact: It deals 4 damage to target artifact creature.",
    },
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: { kind: "remove-counters", target: 0, counter: "charge", count: 4, upTo: true },
      resolve: null,
      text: "{1}, {T}, Sacrifice this artifact: Remove up to four charge counters from target noncreature artifact.",
    },
  ],
});

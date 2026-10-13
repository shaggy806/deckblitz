import { defineCard } from "../define.js";

// EDHREC rank 561.
//
// Rulings:
//   [2020-04-17] To move a counter from one creature to another, the counter is removed from the
//     first permanent and put on the second. Any abilities that care about a counter being removed
//     from or put onto a permanent will apply.
//   [2020-04-17] You choose the two target permanents as Nesting Grounds's second ability is put
//     onto the stack. You choose which kind of counter to move as that ability resolves.
//   [2020-04-17] If either permanent becomes an illegal target, no counter is removed or put.
//   [2020-04-17] The two target permanents don't have to share a type, which can result in some
//     counters on permanents that would not occur normally, such as loyalty counters on creatures
//     or +1/+1 counters on lands. Keyword counters will grant the permanent that keyword even if
//     it's meaningless (such as trample on an enchantment); +1/+1 counters won't affect the
//     permanent unless it's a creature; and many named counters (such as soul counters) won't have
//     an effect unless the recipient permanent refers to them in some way.

export default defineCard({
  name: "Nesting Grounds",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}, {T}: Move a counter from target permanent you control onto a second target permanent. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      // The kind is chosen as it resolves (the ruling). Either target gone,
      // nothing is removed or put (rule 122.5).
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: {} }, "permanent"],
      effect: { kind: "move-counters", from: 0, to: 1 },
      resolve: null,
      text: "{1}, {T}: Move a counter from target permanent you control onto a second target permanent. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});

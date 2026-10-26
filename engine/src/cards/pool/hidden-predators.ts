import { defineCard } from "../define.js";

// EDHREC rank 28135.
//
// Rulings:
//   When it turns into a creature, it is no longer an enchantment.
//   A noncreature permanent that turns into a creature can attack, and its {T} abilities can be
//     activated, only if its controller has continuously controlled that permanent since the
//     beginning of their most recent turn.
//
// A state trigger (rule 603.8): "an opponent controls a creature with power 4
// or greater" is its state. "If this permanent is an enchantment" is an
// intervening-if (rule 603.4), checked as it triggers and as it resolves;
// `setTypes` makes it a creature and no longer an enchantment, so it never
// triggers again (Hidden Spider's animate).
const TEXT =
  "When an opponent controls a creature with power 4 or greater, if this permanent is an enchantment, it becomes a 4/4 Beast creature.";

export default defineCard({
  name: "Hidden Predators",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "opponent-controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Beast"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

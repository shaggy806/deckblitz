import { defineCard } from "../define.js";

// EDHREC rank 3687. Overloaded, the artifacts are found as it begins (none of
// the 0/0s die before the counters, no state-based actions come in between);
// "that became a creature this way" is the artifact the same turn acts on.

export default defineCard({
  name: "Rise and Shine",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target noncreature artifact you control becomes a 0/0 artifact creature. Put four +1/+1 counters on each artifact that became a creature this way.\nOverload {4}{U}{U} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact", notTypes: ["creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become", target: 0, power: 0, toughness: 0, addTypes: ["artifact", "creature"], duration: "permanent" },
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 4 },
    ],
  },
  overload: {
    cost: "{4}{U}{U}",
    effect: {
      kind: "for-each-permanent",
      filter: { type: "artifact", notTypes: ["creature"], controlledBy: "you" },
      simultaneous: true,
      effect: {
        kind: "sequence",
        effects: [
          { kind: "become", target: 0, power: 0, toughness: 0, addTypes: ["artifact", "creature"], duration: "permanent" },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 4 },
        ],
      },
    },
  },
});

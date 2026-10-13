import { defineCard } from "../define.js";

// EDHREC rank 2136.
//
// Rulings:
//   [2023-11-03] If an attacking creature has multiple evasion abilities, such as shadow and
//     flying, a creature can block it only if that creature satisfies all of the appropriate
//     evasion abilities.
//   [2023-11-03] Once a creature has been blocked, that creature remains blocked and will deal and
//     be dealt combat damage even if it gains or loses shadow or if the blocking creature gains or
//     loses shadow.
//   [2023-11-03] Multiple instances of shadow on the same creature are redundant.
//   [2023-11-03] A permanent with a shadow counter on it has shadow.

export default defineCard({
  name: "Minas Morgul, Dark Fortress",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "Minas Morgul enters tapped.\n{T}: Add {B}.\n{3}{B}, {T}: Put a shadow counter on target creature. For as long as that creature has a shadow counter on it, it's a Wraith in addition to its other types. (A creature with shadow can block or be blocked by only creatures with shadow.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: "{3}{B}", tap: true },
      // A shadow counter is a keyword counter (rule 122.1b): it has shadow
      // while it has one. The Wraith lasts as long (Aquitect's Will's
      // `whileCounter` — rule 611.2b), and a counter put on again later
      // doesn't bring it back.
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "shadow", amount: 1 },
          { kind: "add-types", target: 0, addSubtypes: ["Wraith"], duration: { whileCounter: "shadow" } },
        ],
      },
      resolve: null,
      text: "{3}{B}, {T}: Put a shadow counter on target creature. For as long as that creature has a shadow counter on it, it's a Wraith in addition to its other types.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "Minas Morgul enters tapped.",
    },
  ],
});

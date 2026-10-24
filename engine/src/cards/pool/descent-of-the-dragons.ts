import { defineCard } from "../define.js";

// "For each creature destroyed this way, its controller creates a 4/4 red
// Dragon": the destroy's own record, counted per player — a creature that
// regenerates or is indestructible isn't destroyed and makes nothing (the
// ruling).
export default defineCard({
  name: "Descent of the Dragons",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy any number of target creatures. For each creature destroyed this way, its controller creates a 4/4 red Dragon creature token with flying.",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      {
        kind: "create-token",
        token: "Dragon Token (Dragonback Assault)",
        who: "each-player",
        count: { thisWay: "destroyed", who: "each" },
      },
    ],
  },
});

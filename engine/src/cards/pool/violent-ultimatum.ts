import { defineCard } from "../define.js";

// EDHREC rank 18693. Shards of Alara.
//
// Exactly three different targets (the ruling); the ones still legal as it
// resolves are destroyed together (Hex's shape).
export default defineCard({
  name: "Violent Ultimatum",
  manaCost: "{B}{B}{R}{R}{R}{G}{G}",
  colors: ["B", "R", "G"],
  types: ["sorcery"],
  text: "Destroy three target permanents.",
  targets: [{ kind: "any-number", of: "permanent", min: 3, max: 3 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "destroy", target: 0 },
    simultaneous: true,
  },
});

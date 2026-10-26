import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 16469. Flames of the Firebrand's shape: the
// split is chosen as it's cast, at least 1 to each target (the ruling).

export default defineCard({
  name: "Arc Lightning",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Arc Lightning deals 3 damage divided as you choose among one, two, or three targets.",
  targets: [{ kind: "any-number", of: "any-target", min: 1, max: 3 }],
  divided: { total: 3, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});

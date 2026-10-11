import { defineCard } from "../define.js";

export default defineCard({
  name: "Lightning Bolt",
  // Pinned: Scryfall answers "Lightning Bolt" by name with Emeritus of Conflict // Lightning Bolt, whose
  // prepare spell or adventure shares the name.
  art: "7673784e-db4b-43a1-8d55-1bb9fc1e284f",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Lightning Bolt deals 3 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});

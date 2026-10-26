import { defineCard } from "../define.js";

// EDHREC rank 28783. Get Out's "creature or enchantment spell" shape.

export default defineCard({
  name: "Mystic Denial",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature or sorcery spell.",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["creature", "sorcery"] } }],
  effect: { kind: "counter", target: 0 },
});

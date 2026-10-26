import { defineCard } from "../define.js";

// Rulings:
//   If the spell's target leaves the battlefield before this spell resolves, Intervene won't
//   resolve since it no longer targets a spell that targets a creature.
//   It means "targeting at least one creature" not "exactly one creature".

const TEXT = "Counter target spell that targets a creature.";

export default defineCard({
  name: "Intervene",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "spell", filter: { targets: { permanent: { type: "creature" } } } }],
  effect: { kind: "counter", target: 0 },
});

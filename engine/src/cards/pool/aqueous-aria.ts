import { defineCard } from "../define.js";

// Campus Composer's prepare spell (rule 722): no card of its own, only ever
// cast as the copy a prepared Composer makes in exile (722.3c).
export default defineCard({
  name: "Aqueous Aria",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Create a 3/3 blue and red Elemental creature token with flying.",
  effect: { kind: "create-token", token: "Elemental Token (3/3 Blue-Red Flying)", count: 1 },
});

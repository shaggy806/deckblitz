import { defineCard } from "../define.js";

export default defineCard({
  name: "Braingeyser",
  // Pinned: Scryfall answers "Braingeyser" by name with Dirgur Focusmage // Braingeyser, whose
  // prepare spell or adventure shares the name.
  art: "23b33d16-dbaa-4742-9317-eac745f772ac",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player draws X cards.",
  targets: ["player"],
  effect: { kind: "draw", amount: "x", target: 0 },
});

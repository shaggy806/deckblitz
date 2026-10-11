import { defineCard } from "../define.js";

export default defineCard({
  name: "Careful Study",
  // Pinned: Scryfall answers "Careful Study" by name with Spellbook Seeker // Careful Study, whose
  // prepare spell or adventure shares the name.
  art: "dea15b53-2940-40e7-8d48-8ec11341da83",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw two cards, then discard two cards.",
  effect: {
    kind: "sequence",
    effects: [{ kind: "draw", amount: 2 }, { kind: "discard", target: "you", amount: 2 }],
  },
});

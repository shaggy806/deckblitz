import { defineCard } from "../define.js";

// `return-from-graveyard`'s `all-graveyards`, as Liliana Vess's ultimate says
// the same thing.

export default defineCard({
  name: "Rise of the Dark Realms",
  manaCost: "{7}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Put all creature cards from all graveyards onto the battlefield under your control.",
  targets: [],
  effect: {
    kind: "return-from-graveyard",
    from: "all-graveyards",
    filter: { type: "creature" },
    destination: "battlefield",
    count: "all",
  },
});

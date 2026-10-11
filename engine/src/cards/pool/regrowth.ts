import { defineCard } from "../define.js";

export default defineCard({
  name: "Regrowth",
  // Pinned: Scryfall answers "Regrowth" by name with Emeritus of Abundance // Regrowth, whose
  // prepare spell or adventure shares the name.
  art: "d771fc5d-b9a1-4637-8241-3f54616b64af",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return target card from your graveyard to your hand.",
  targets: [{ kind: "card-in-graveyard", whose: "you" }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});

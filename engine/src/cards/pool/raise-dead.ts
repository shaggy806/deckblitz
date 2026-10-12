import { defineCard } from "../define.js";

export default defineCard({
  name: "Raise Dead",
  // Its own art: by name, Scryfall finds Cheerful Osteomancer's prepare spell.
  art: "4950c3c2-80c1-4447-ac38-cf40f76b9545",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to your hand.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});

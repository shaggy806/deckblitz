import { defineCard } from "../define.js";

// Mirage. EDHREC rank 20484.

export default defineCard({
  name: "Ashen Powder",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Put target creature card from an opponent's graveyard onto the battlefield under your control.",
  targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { type: "creature" } }],
  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
});

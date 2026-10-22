import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 16476. Amonkhet. Soul Salvage with cycling.

export default defineCard({
  name: "Wander in Death",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  text: "Return up to two target creature cards from your graveyard to your hand.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});

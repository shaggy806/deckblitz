import { defineCard } from "../define.js";

const DRAW_TEXT =
  "{2}, {T}, Sacrifice The Forgotten Place: Draw a card for each Locus and/or Sphere in your graveyard.";

export default defineCard({
  name: "The Forgotten Place",
  colors: [],
  types: ["land"],
  subtypes: ["Locus", "Sphere"],
  text: `The Forgotten Place enters the battlefield tapped.\n{T}: Add {C}.\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      // Sacrificed as the cost, it's in the graveyard to be counted (one card, a Locus and a Sphere).
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "draw",
        amount: { countInGraveyard: { subtypes: ["Locus", "Sphere"], ownedBy: "you" } },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "The Forgotten Place enters the battlefield tapped.",
    },
  ],
});

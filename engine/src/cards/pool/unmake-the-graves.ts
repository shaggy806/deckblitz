import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Magic 2015. EDHREC rank 23018. Dutiful Return's shape, with convoke.

export default defineCard({
  name: "Unmake the Graves",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nReturn up to two target creature cards from your graveyard to your hand.",
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

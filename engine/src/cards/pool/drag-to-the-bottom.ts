import { defineCard } from "../define.js";

/** -X/-X, X = 1 plus domain, with the card's own minus sign (Toxic Deluge's
 * `product`). */
const MINUS_X = { product: [{ sum: [1, { basicLandTypes: "you" }] }, -1] } as const;

export default defineCard({
  name: "Drag to the Bottom",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Domain — Each creature gets -X/-X until end of turn, where X is 1 plus the number of basic land types among lands you control.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: MINUS_X,
    toughness: MINUS_X,
    duration: "end-of-turn",
  },
});

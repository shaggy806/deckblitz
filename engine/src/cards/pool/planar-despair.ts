import { defineCard } from "../define.js";

// EDHREC rank 29816.

const DOMAIN = { product: [{ basicLandTypes: "you" }, -1] } as const;

export default defineCard({
  name: "Planar Despair",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Domain — All creatures get -1/-1 until end of turn for each basic land type among lands you control.",
  effect: { kind: "modify-pt-all", filter: { type: "creature" }, power: DOMAIN, toughness: DOMAIN, duration: "end-of-turn" },
});

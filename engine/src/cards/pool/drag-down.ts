import { defineCard } from "../define.js";

// Conflux (CON). EDHREC rank 29143. Domain, negated (Escaped Experiment's
// `product` with -1).
const DOMAIN = { product: [{ basicLandTypes: "you" }, -1] } as const;

export default defineCard({
  name: "Drag Down",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Domain — Target creature gets -1/-1 until end of turn for each basic land type among lands you control.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: DOMAIN, toughness: DOMAIN, duration: "end-of-turn" },
});

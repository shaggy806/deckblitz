import { defineCard } from "../define.js";

/** A Forest land token — not basic, and its "{T}: Add {G}." comes from the
 * Forest type (rule 305.6). Generated Horizons' token; no token printing in
 * the Oracle snapshot. */
export default defineCard({
  name: "Forest Token",
  colors: [],
  types: ["land"],
  subtypes: ["Forest"],
  text: "({T}: Add {G}.)",
});

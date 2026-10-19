import { defineCard } from "../define.js";

/** Cybernetica Datasmith's token — a 4/4 colorless Robot artifact creature with "This token can't
 * block." */
export default defineCard({
  name: "Robot Token (Cybernetica Datasmith)",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 4,
  toughness: 4,
  text: "This token can't block.",
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "This token can't block." }],
});

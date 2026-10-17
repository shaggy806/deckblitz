import { defineCard } from "../define.js";

/** 4/2 red Pirate with "This token can't block." — Nettling Nuisance's token. */
export default defineCard({
  name: "Pirate Token (Nettling Nuisance)",
  art: "d5f108e7-7454-4c11-b1de-97d0bcc3c470",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Pirate"],
  power: 4,
  toughness: 2,
  text: "This token can't block.",
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "This token can't block." }],
});

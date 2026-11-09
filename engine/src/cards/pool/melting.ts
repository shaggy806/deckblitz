import { defineCard } from "../define.js";

const TEXT = "All lands are no longer snow.";

export default defineCard({
  name: "Melting",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [{ affects: { scope: "filter", filter: { type: "land" } }, removeSupertypes: ["snow"], text: TEXT }],
});

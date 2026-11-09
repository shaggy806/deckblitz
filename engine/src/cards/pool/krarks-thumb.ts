import { defineCard } from "../define.js";

const TEXT = "If you would flip a coin, instead flip two coins and ignore one.";

export default defineCard({
  name: "Krark's Thumb",
  manaCost: "{2}",
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  static: [{ affects: { scope: "self" }, replacement: { event: "would-flip-coin", who: "you", ignore: true }, text: TEXT }],
});

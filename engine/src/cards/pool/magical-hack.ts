import { defineCard } from "../define.js";

// EDHREC rank 22100. A text-changing effect (rule 612): a land type in its
// rules text or its type line — a Forest made an Island taps for {U} (305.6).

export default defineCard({
  name: "Magical Hack",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: 'Change the text of target spell or permanent by replacing all instances of one basic land type with another. (For example, you may change "swampwalk" to "plainswalk." This effect lasts indefinitely.)',
  targets: [{ kind: "spell-or-permanent" }],
  effect: { kind: "change-text", target: 0, words: "land-type", duration: "permanent" },
});

import { defineCard } from "../define.js";

// EDHREC rank 15576. A text-changing effect (rule 612): the first word chosen
// says which kind the second must be.

export default defineCard({
  name: "Mind Bend",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: 'Change the text of target permanent by replacing all instances of one color word with another or one basic land type with another. (For example, you may change "nonblack creature" to "nongreen creature" or "forestwalk" to "islandwalk." This effect lasts indefinitely.)',
  targets: ["permanent"],
  effect: { kind: "change-text", target: 0, words: "color-or-land-type", duration: "permanent" },
});

import { defineCard } from "../define.js";

// EDHREC rank 18011. A text-changing effect (rule 612): both words are chosen
// as it resolves; a spell keeps the change as the permanent it becomes (400.7a).

export default defineCard({
  name: "Sleight of Mind",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: 'Change the text of target spell or permanent by replacing all instances of one color word with another. (For example, you may change "target black spell" to "target blue spell." This effect lasts indefinitely.)',
  targets: [{ kind: "spell-or-permanent" }],
  effect: { kind: "change-text", target: 0, words: "color", duration: "permanent" },
});

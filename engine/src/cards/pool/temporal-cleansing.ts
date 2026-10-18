import { defineCard } from "../define.js";

// EDHREC rank 12770. March of the Machine.
//
// Lost Days' shape: the owner chooses second from the top or the bottom
// (`ownerChooses`), and everyone sees the choice (the ruling).

export default defineCard({
  name: "Temporal Cleansing",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nThe owner of target nonland permanent puts it into their library second from the top or on the bottom.",
  targets: ["nonland-permanent"],
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: [{ fromTop: 2 }, "bottom"] } },
});

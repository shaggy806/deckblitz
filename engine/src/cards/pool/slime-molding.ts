import { defineCard } from "../define.js";

// EDHREC rank 16744. The X/X green Ooze is Convert to Slime's token, its base P/T set by the
// effect (Gelatinous Genesis's shape).

export default defineCard({
  name: "Slime Molding",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create an X/X green Ooze creature token.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Ooze Token (Convert to Slime)",
    count: 1,
    basePt: { power: "x", toughness: "x" },
  },
});

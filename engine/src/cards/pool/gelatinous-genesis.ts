import { defineCard } from "../define.js";

// The X/X green Ooze is Convert to Slime's token: its base P/T is set by
// the effect that makes it (`basePt`).
export default defineCard({
  name: "Gelatinous Genesis",
  manaCost: "{X}{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create X X/X green Ooze creature tokens.",
  effect: {
    kind: "create-token",
    token: "Ooze Token (Convert to Slime)",
    count: "x",
    basePt: { power: "x", toughness: "x" },
  },
});

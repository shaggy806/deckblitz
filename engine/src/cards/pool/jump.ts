import { defineCard } from "../define.js";

export default defineCard({
  name: "Jump",
  // Pinned: Scryfall answers "Jump" by name with Encouraging Aviator // Jump, whose
  // prepare spell or adventure shares the name.
  art: "2edd7be9-9334-4684-b642-1aaf2000e054",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature gains flying until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "grant-keyword",
    target: 0,
    keyword: "flying",
    duration: "end-of-turn",
  },
});

import { defineCard } from "../define.js";

// Legends. EDHREC rank 25435.
export default defineCard({
  name: "Part Water",
  manaCost: "{X}{X}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "X target creatures gain islandwalk until end of turn. (They can't be blocked as long as defending player controls an Island.)",
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "grant-keyword", target: 0, keyword: "islandwalk", duration: "end-of-turn" },
  },
});

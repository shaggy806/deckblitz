import { defineCard } from "../define.js";

// EDHREC rank 15814.

export default defineCard({
  name: "Enlarge",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature gets +7/+7 and gains trample until end of turn. It must be blocked this turn if able. (A creature with trample can deal excess combat damage to the player or planeswalker it's attacking.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 7, toughness: 7, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
    ],
  },
});

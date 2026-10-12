import { defineCard } from "../define.js";

export default defineCard({
  name: "Bombadil's Song",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gets +1/+1 and gains hexproof until end of turn. The Ring tempts you. (A creature with hexproof can't be the target of spells or abilities your opponents control.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
        ],
      },
      { kind: "the-ring-tempts-you" },
    ],
  },
});

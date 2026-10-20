import { defineCard } from "../define.js";

// EDHREC rank 16373.

export default defineCard({
  name: "Shell Shield",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Kicker {1} (You may pay an additional {1} as you cast this spell.)\nTarget creature you control gets +0/+3 until end of turn. If this spell was kicked, that creature also gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
  targets: ["creature-you-control"],
  effect: { kind: "modify-pt", target: 0, power: 0, toughness: 3, duration: "end-of-turn" },
  kicker: {
    cost: "{1}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 0, toughness: 3, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      ],
    },
  },
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Woodcutter's Grit",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gets +3/+3 and gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
    ],
  },
});

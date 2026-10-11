import { defineCard } from "../define.js";

// EDHREC rank 6840. Blossoming Defense's shape.
export default defineCard({
  name: "Ranger's Guile",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gets +1/+1 and gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
    ],
  },
});

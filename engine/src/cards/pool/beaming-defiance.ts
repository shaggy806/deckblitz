import { defineCard } from "../define.js";

export default defineCard({
  name: "Beaming Defiance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature you control gets +2/+2 and gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
    ],
  },
});

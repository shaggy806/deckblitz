import { defineCard } from "../define.js";

export default defineCard({
  name: "Stolen Vitality",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +3/+1 until end of turn. If it's your turn, that creature gains trample until end of turn. Otherwise, it gains first strike until end of turn. (A creature with trample can deal excess combat damage to the player or planeswalker it's attacking. A creature with first strike deals combat damage before creatures without first strike.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 1, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "your-turn" },
        then: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        else: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      },
    ],
  },
});

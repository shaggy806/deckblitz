import { defineCard } from "../define.js";

export default defineCard({
  name: "Crowd's Favor",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nTarget creature gets +1/+0 and gains first strike until end of turn. (It deals combat damage before creatures without first strike.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Wild Hunger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  flashback: { cost: "{3}{R}" },
  text: "Target creature gets +3/+1 and gains trample until end of turn.\nFlashback {3}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});

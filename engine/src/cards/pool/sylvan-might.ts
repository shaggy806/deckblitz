import { defineCard } from "../define.js";

export default defineCard({
  name: "Sylvan Might",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  flashback: { cost: "{2}{G}{G}" },
  text: "Target creature gets +2/+2 and gains trample until end of turn.\nFlashback {2}{G}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});

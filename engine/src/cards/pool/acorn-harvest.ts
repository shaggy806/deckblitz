import { defineCard } from "../define.js";

export default defineCard({
  name: "Acorn Harvest",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{1}{G}", payLife: 3 },
  text: "Create two 1/1 green Squirrel creature tokens.\nFlashback—{1}{G}, Pay 3 life. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: { kind: "create-token", token: "Squirrel Token", count: 2 },
});

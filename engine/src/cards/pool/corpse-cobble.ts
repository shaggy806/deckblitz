import { defineCard } from "../define.js";

export default defineCard({
  name: "Corpse Cobble",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice any number of creatures.\nCreate an X/X blue and black Zombie creature token with menace, where X is the total power of the sacrificed creatures.\nFlashback {3}{U}{B} (You may cast this card from your graveyard for its flashback cost and any additional costs. Then exile it.)",
  flashback: { cost: "{3}{U}{B}" },
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" }, sacrificeCount: "x" },
  effect: {
    kind: "create-token",
    token: "Zombie Token (Blue-Black, Menace)",
    count: 1,
    basePt: { power: { aggregate: "sum", of: "power", filter: {}, in: { paid: "sacrificed" } }, toughness: { aggregate: "sum", of: "power", filter: {}, in: { paid: "sacrificed" } } },
  },
});

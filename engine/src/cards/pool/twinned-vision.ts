import { defineCard } from "../define.js";

export default defineCard({
  name: "Twinned Vision",
  manaCost: "{1}{U/R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Draw a card. If this spell wasn't cast from your hand, draw two cards instead.\nFlashback—{1}{U/R}{U/R}, Discard a card. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: {
    kind: "conditional",
    condition: { kind: "not", of: { kind: "source", filter: { castFrom: "hand" } } },
    then: { kind: "draw", amount: 2 },
    else: { kind: "draw", amount: 1 },
  },
  flashback: { cost: "{1}{U/R}{U/R}", discard: 1 },
});

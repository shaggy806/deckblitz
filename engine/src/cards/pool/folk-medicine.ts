import { defineCard } from "../define.js";

// EDHREC rank 29475.

export default defineCard({
  name: "Folk Medicine",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  flashback: { cost: "{1}{W}" },
  text: "You gain 1 life for each creature you control.\nFlashback {1}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
});

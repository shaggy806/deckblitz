import { defineCard } from "../define.js";

export default defineCard({
  name: "Purify the Grave",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  flashback: { cost: "{W}" },
  text: "Exile target card from a graveyard.\nFlashback {W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: { kind: "exile", target: 0 },
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Coffin Purge",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  flashback: { cost: "{B}" },
  text: "Exile target card from a graveyard.\nFlashback {B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: { kind: "exile", target: 0 },
});

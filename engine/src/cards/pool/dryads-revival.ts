import { defineCard } from "../define.js";

// EDHREC rank 7167.

export default defineCard({
  name: "Dryad's Revival",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{4}{G}" },
  text: "Return target card from your graveyard to your hand.\nFlashback {4}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "card-in-graveyard", whose: "you" }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});

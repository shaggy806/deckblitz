import { defineCard } from "../define.js";

// Any creature you own, even one another player controls (the ruling).
export default defineCard({
  name: "Saving Grasp",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  flashback: { cost: "{W}" },
  text: "Return target creature you own to your hand.\nFlashback {W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", ownedBy: "you" } }],
  effect: { kind: "return-to-hand", target: 0 },
});

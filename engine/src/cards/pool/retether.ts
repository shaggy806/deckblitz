import { defineCard } from "../define.js";

// EDHREC rank 3675. An Aura returns only onto a creature, whatever its enchant
// ability says (the rulings), each host chosen as it enters; one with no
// creature it can enchant stays in the graveyard (rule 303.4g).
export default defineCard({
  name: "Retether",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return each Aura card from your graveyard to the battlefield. Only creatures can be enchanted this way. (Aura cards that can't enchant a creature on the battlefield remain in your graveyard.)",
  targets: [],
  effect: {
    kind: "return-from-graveyard",
    filter: { subtype: "Aura" },
    destination: "battlefield",
    count: "all",
    attachedTo: { among: { type: "creature" } },
  },
});

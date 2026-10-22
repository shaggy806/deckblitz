import { defineCard } from "../define.js";

// EDHREC rank 12430. "You own" is the owner, whoever controls it now — a
// token's owner is the player it was created under (the rulings).
export default defineCard({
  name: "Despotic Scepter",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Destroy target permanent you own. It can't be regenerated.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { ownedBy: "you" } }],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "{T}: Destroy target permanent you own. It can't be regenerated.",
    },
  ],
});

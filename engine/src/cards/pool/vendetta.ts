import { defineCard } from "../define.js";

// EDHREC rank 11410. Devour in Shadow's shape on a
// nonblack target: the toughness is read from the creature's last existence
// on the battlefield, and an illegal target means no life lost (its rulings).

export default defineCard({
  name: "Vendetta",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonblack creature. It can't be regenerated. You lose life equal to that creature's toughness.",
  targets: ["nonblack-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      { kind: "lose-life", amount: { toughnessOf: 0 } },
    ],
  },
});

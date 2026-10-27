import { defineCard } from "../define.js";

// EDHREC rank 13185.
//
// Rulings:
//   [2021-03-19] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when
//     you could normally cast a sorcery.

export default defineCard({
  name: "Recoup",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{3}{R}" },
  text:
    "Target sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost. (Mana cost includes color.)\n" +
    "Flashback {3}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "sorcery" } }],
  // Snapcaster Mage's grant: flashback until end of turn at its mana cost.
  effect: { kind: "grant-flashback", target: 0 },
});

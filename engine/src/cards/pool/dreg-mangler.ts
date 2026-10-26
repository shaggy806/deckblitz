import { defineCard } from "../define.js";

// EDHREC rank 24265.
//
// Rulings:
//   [2013-04-15] Exiling the creature card with scavenge is part of the cost of activating the
//     scavenge ability. Once the ability is activated and the cost is paid, it's too late to stop
//     the ability from being activated by trying to remove the creature card from the graveyard.
//
// Scavenge as Bannerhide Krushok authors it.

const SCAVENGE =
  "Scavenge {3}{B}{G} ({3}{B}{G}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)";

export default defineCard({
  name: "Dreg Mangler",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Plant", "Zombie"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${SCAVENGE}`,
  activated: [
    {
      cost: { mana: "{3}{B}{G}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: SCAVENGE,
    },
  ],
});

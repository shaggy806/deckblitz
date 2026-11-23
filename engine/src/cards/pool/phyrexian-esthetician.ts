import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Oil Scavenge is scavenge (rule 702.97a)
// with oil counters: the card's own ability in the graveyard, exiling it as
// the cost, its power read as it last existed there.

const OIL_SCAVENGE =
  "Oil Scavenge {3}{R} ({3}{R}, Exile this card from your graveyard: Put a number of oil counters equal to this card's power on target creature. Oil Scavenge only as a sorcery.)";

export default defineCard({
  name: "Phyrexian Esthetician",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 4,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${OIL_SCAVENGE}`,
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature" } }],
      effect: { kind: "add-counter", target: 0, counter: "oil", amount: { powerOf: { paid: "exiled-self" } } },
      resolve: null,
      text: OIL_SCAVENGE,
    },
  ],
});

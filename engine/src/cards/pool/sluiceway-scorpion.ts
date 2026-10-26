import { defineCard } from "../define.js";

// EDHREC rank 26926.
//
// Scavenge (rule 702.97a): exiling the card from the graveyard is part of the
// cost; counters equal to the exiled card's power, as a sorcery.

const SCAVENGE_TEXT =
  "Scavenge {1}{B}{G} ({1}{B}{G}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)";

export default defineCard({
  name: "Sluiceway Scorpion",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Scorpion"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\n${SCAVENGE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}{G}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: SCAVENGE_TEXT,
    },
  ],
});

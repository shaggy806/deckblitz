import { defineCard } from "../define.js";

// EDHREC rank 27401.
//
// Scavenge (rule 702.97a): exiling the card from the graveyard is part of the
// cost; counters equal to the exiled card's power, as a sorcery.

const SCAVENGE_TEXT =
  "Scavenge {6}{B} ({6}{B}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)";

export default defineCard({
  name: "Terrus Wurm",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wurm"],
  power: 5,
  toughness: 5,
  text: SCAVENGE_TEXT,
  activated: [
    {
      cost: { mana: "{6}{B}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: SCAVENGE_TEXT,
    },
  ],
});

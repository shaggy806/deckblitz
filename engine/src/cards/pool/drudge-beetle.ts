import { defineCard } from "../define.js";

// EDHREC rank 25455.
//
// Scavenge (rule 702.97a): exiling the card from the graveyard is part of the
// cost; counters equal to the exiled card's power, as a sorcery.

const SCAVENGE_TEXT =
  "Scavenge {5}{G} ({5}{G}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)";

export default defineCard({
  name: "Drudge Beetle",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  text: SCAVENGE_TEXT,
  activated: [
    {
      cost: { mana: "{5}{G}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: SCAVENGE_TEXT,
    },
  ],
});

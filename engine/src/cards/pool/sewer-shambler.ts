import { defineCard } from "../define.js";

// Return to Ravnica. EDHREC rank 23998.

const SCAVENGE_TEXT =
  "Scavenge {2}{B} ({2}{B}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)";

export default defineCard({
  name: "Sewer Shambler",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  keywords: ["swampwalk"],
  text: `Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\n${SCAVENGE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: SCAVENGE_TEXT,
    },
  ],
});

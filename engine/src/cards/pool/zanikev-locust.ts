import { defineCard } from "../define.js";

const SCAVENGE_TEXT =
  "Scavenge {2}{B}{B} ({2}{B}{B}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)";

export default defineCard({
  name: "Zanikev Locust",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${SCAVENGE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}{B}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: SCAVENGE_TEXT,
    },
  ],
});

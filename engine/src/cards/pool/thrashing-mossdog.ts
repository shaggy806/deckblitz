import { defineCard } from "../define.js";

const SCAVENGE_TEXT =
  "Scavenge {4}{G}{G} ({4}{G}{G}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)";

export default defineCard({
  name: "Thrashing Mossdog",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Dog"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${SCAVENGE_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{G}{G}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: SCAVENGE_TEXT,
    },
  ],
});

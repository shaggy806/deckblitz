import { defineCard } from "../define.js";

const SCAVENGE_TEXT =
  "Scavenge {0} ({0}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)";

export default defineCard({
  name: "Slitherhead",
  manaCost: "{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Plant", "Zombie"],
  power: 1,
  toughness: 1,
  text: SCAVENGE_TEXT,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: SCAVENGE_TEXT,
    },
  ],
});

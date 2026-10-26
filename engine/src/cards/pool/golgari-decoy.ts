import { defineCard } from "../define.js";

// Return to Ravnica. EDHREC rank 20266.

const LURE_TEXT = "All creatures able to block this creature do so.";
const SCAVENGE_TEXT =
  "Scavenge {3}{G}{G} ({3}{G}{G}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)";

export default defineCard({
  name: "Golgari Decoy",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Rogue"],
  power: 2,
  toughness: 2,
  text: `${LURE_TEXT}\n${SCAVENGE_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-be-blocked"], text: LURE_TEXT }],
  activated: [
    {
      cost: { mana: "{3}{G}{G}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
      resolve: null,
      text: SCAVENGE_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 18118. Morningtide.
const TEXT = "{T}, Exile an Assassin card from your graveyard: Destroy target creature.";

export default defineCard({
  name: "Scarblade Elite",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Assassin"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, exileFromGraveyard: { count: 1, filter: { subtype: "Assassin" } } },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 31691.

export default defineCard({
  name: "D'Vana Tendi, Optimistic Ensign",
  manaCost: "{1}{G/U}{G/U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orion", "Scientist"],
  power: 2,
  toughness: 4,
  text: "{T}: Untap another target permanent.\n{3}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: "permanent" }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "{T}: Untap another target permanent.",
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "{3}: Surveil 1.",
    },
  ],
});

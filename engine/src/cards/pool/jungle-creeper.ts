import { defineCard } from "../define.js";

// EDHREC rank 30046. Rivals of Ixalan.

export default defineCard({
  name: "Jungle Creeper",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  text: "{3}{B}{G}: Return this card from your graveyard to your hand.",
  activated: [
    {
      cost: { mana: "{3}{B}{G}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: "{3}{B}{G}: Return this card from your graveyard to your hand.",
    },
  ],
});

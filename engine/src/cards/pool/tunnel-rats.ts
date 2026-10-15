import { defineCard } from "../define.js";

// EDHREC rank 22134.
//
// Reassembling Skeleton's graveyard ability: the cost doesn't exile the card
// (`staysInZone`).

const TEXT = "{4}{B}: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Tunnel Rats",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});

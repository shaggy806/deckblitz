import { defineCard } from "../define.js";

// EDHREC rank 24777.

const TEXT =
  "Corrupted — {2}{B}: Return this card from your graveyard to the battlefield tapped. You lose 1 life. Activate only if an opponent has three or more poison counters.";

export default defineCard({
  name: "Fleshless Gladiator",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Skeleton"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "source", enterTapped: true },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

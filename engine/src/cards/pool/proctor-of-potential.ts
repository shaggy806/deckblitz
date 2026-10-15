import { defineCard } from "../define.js";

// EDHREC rank 18094.

export default defineCard({
  name: "Proctor of Potential",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 1,
  text: "Whenever this creature or another creature you control enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)\n{W}{U}: Return this card from your graveyard to the battlefield with a finality counter on it. Activate only if you've scried or surveilled this turn. (If a creature with a finality counter on it would die, exile it instead.)",
  activated: [
    {
      cost: { mana: "{W}{U}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "turn-stat", stat: "scried-or-surveilled", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", withCounters: { kind: "finality", amount: 1 } },
      resolve: null,
      text: "{W}{U}: Return this card from your graveyard to the battlefield with a finality counter on it. Activate only if you've scried or surveilled this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "Whenever this creature or another creature you control enters, surveil 1.",
    },
  ],
});

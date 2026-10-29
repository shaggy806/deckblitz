import { defineCard } from "../define.js";

// EDHREC rank 3378.
// Makes Treasure → use "Treasure Token".
// Makes Inkling → use "Inkling Token".

export default defineCard({
  name: "Fain, the Broker",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 3,
  text: "{T}, Sacrifice a creature: Put two +1/+1 counters on target creature.\n{T}, Remove a counter from a creature you control: Create a Treasure token.\n{T}, Sacrifice an artifact: Create a 2/1 white and black Inkling creature token with flying.\n{3}{B}: Untap Fain.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "{T}, Sacrifice a creature: Put two +1/+1 counters on target creature.",
    },
    {
      cost: {
        mana: null,
        tap: true,
        removeCounter: { kind: "any", count: 1, from: { type: "creature" } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "{T}, Remove a counter from a creature you control: Create a Treasure token.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "create-token", token: "Inkling Token", count: 1 },
      resolve: null,
      text: "{T}, Sacrifice an artifact: Create a 2/1 white and black Inkling creature token with flying.",
    },
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "{3}{B}: Untap Fain.",
    },
  ],
});

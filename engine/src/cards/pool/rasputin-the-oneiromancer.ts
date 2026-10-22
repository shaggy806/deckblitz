import { defineCard } from "../define.js";

// EDHREC rank 21329.
// Makes Goblin → use "Goblin Token".
// Makes Knight → new token "Knight Token (Rasputin, the Oneiromancer)" (scaffolded).

export default defineCard({
  name: "Rasputin, the Oneiromancer",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 1,
  text: "When Rasputin enters, put a dream counter on it for each opponent you have. Each opponent creates a 1/1 red Goblin creature token.\n{T}, Remove one or more dream counters from Rasputin: Add that much {C}.\n{T}, Remove a dream counter from Rasputin: Create a 2/2 white Knight creature token with protection from red.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "dream", count: "x" } },
      // "One or more": X can't be 0.
      minX: 1,
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: "x" },
      resolve: null,
      text: "{T}, Remove one or more dream counters from Rasputin: Add that much {C}.",
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "dream", count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token (Rasputin, the Oneiromancer)", count: 1 },
      resolve: null,
      text: "{T}, Remove a dream counter from Rasputin: Create a 2/2 white Knight creature token with protection from red.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "dream", amount: { countPlayers: "each-opponent" } },
          { kind: "create-token", token: "Goblin Token", who: "each-opponent", count: 1 },
        ],
      },
      resolve: null,
      text: "When Rasputin enters, put a dream counter on it for each opponent you have. Each opponent creates a 1/1 red Goblin creature token.",
    },
  ],
});

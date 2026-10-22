import { defineCard } from "../define.js";

// EDHREC rank 11282. Commander 2017. "If the player can't": nothing was
// sacrificed this way (Doom Foretold).
const TEXT =
  "Whenever Wasitora deals combat damage to a player, that player sacrifices a creature of their choice. If the player can't, you create a 3/3 black, red, and green Cat Dragon creature token with flying.";

export default defineCard({
  name: "Wasitora, Nekoru Queen",
  manaCost: "{2}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Dragon"],
  power: 5,
  toughness: 4,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "trigger-player", filter: { type: "creature" }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atMost: 0 },
            then: { kind: "create-token", token: "Cat Dragon Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

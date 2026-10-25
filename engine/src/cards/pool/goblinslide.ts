import { defineCard } from "../define.js";

// EDHREC rank 11009.
//
// The {1} is decided as the trigger resolves (the ruling); the Goblin has
// haste itself, not only until end of turn.

const TEXT =
  "Whenever you cast a noncreature spell, you may pay {1}. If you do, create a 1/1 red Goblin creature token with haste.";

export default defineCard({
  name: "Goblinslide",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to create a 1/1 red Goblin creature token with haste?",
        cost: "{1}",
        effect: { kind: "create-token", token: "Goblin Token (Haste)", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

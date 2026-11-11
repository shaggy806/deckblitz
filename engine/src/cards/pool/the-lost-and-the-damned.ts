import { defineCard } from "../define.js";

// EDHREC rank 5751. One ability with two events (`sameAbilityAs`): a land
// that enters under your control from anywhere but a hand — a token land, one
// put there from a library or graveyard — and a spell you cast from anywhere
// but your hand.
const TEXT =
  "Whenever a land you control enters from anywhere other than your hand or you cast a spell from anywhere other than your hand, create a 3/3 red Spawn creature token.";

export default defineCard({
  name: "The Lost and the Damned",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "land", not: { enteredFrom: "hand" } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Spawn Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", notFrom: "hand" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "create-token", token: "Spawn Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

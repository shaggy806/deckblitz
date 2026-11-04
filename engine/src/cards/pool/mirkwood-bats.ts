import { defineCard } from "../define.js";

// "Whenever you create … a token" is a token entering under your control: it
// does so under the player who creates it (rule 111.2), and each token is an
// entry of its own. One ability with two events, written as the two triggers it
// comes to.
const TEXT = "Whenever you create or sacrifice a token, each opponent loses 1 life.";

export default defineCard({
  name: "Mirkwood Bats",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: true } },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { token: true } },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: TEXT,
    },
  ],
});

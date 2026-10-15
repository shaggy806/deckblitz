import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 22723.
// "Minotaur or another nontoken creature" is two triggers (`thisOrAnother`):
// Minotaur's own death counts whatever it is by then (a token copy of it
// too), and any other nontoken creature's — anyone's.

const TEXT =
  "Whenever Minotaur, Roxxon CEO or another nontoken creature dies, you create a 2/1 black Villain creature token with menace.";

export default defineCard({
  name: "Minotaur, Roxxon CEO",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Minotaur", "Villain"],
  power: 4,
  toughness: 4,
  text: `${TEXT} (It can't be blocked except by two or more creatures.)`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "dies", who: "any", filter: { type: "creature", token: false } },
      targets: [],
      effect: { kind: "create-token", token: "Villain Token", count: 1 },
      resolve: null,
      text: TEXT,
    }),
  ],
});

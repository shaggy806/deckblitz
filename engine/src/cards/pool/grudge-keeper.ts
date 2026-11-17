import { defineCard } from "../define.js";

// EDHREC rank 12246.
//
// Rulings: the vote's spell or ability finishes resolving before this
// triggers, and it triggers even if the vote's result makes Grudge Keeper
// leave; it reads only the vote that made it trigger. An opponent who voted
// for more than one choice you didn't vote for loses 2 life once; with
// several votes of yours, an opponent loses it only if their vote was for
// none of your choices (`"opponents-who-voted-otherwise"`: an opponent with a
// vote for a choice none of yours was for).

const TEXT =
  "Whenever players finish voting, each opponent who voted for a choice you didn't vote for loses 2 life.";

export default defineCard({
  name: "Grudge Keeper",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "voting-finishes" },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "opponents-who-voted-otherwise" },
      resolve: null,
      text: TEXT,
    },
  ],
});

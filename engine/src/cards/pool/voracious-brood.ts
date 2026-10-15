import { defineCard } from "../define.js";

// EDHREC rank 25242.
//
// Golgari Grave-Troll's enters-with counters; The Gitrog Monster's batched
// graveyard trigger, whose `triggerValue` is how many creature cards that one
// move put there ("that many"). Tokens aren't cards and never count.

const ENTERS_TEXT = "This creature enters with a +1/+1 counter on it for each creature card in your graveyard.";
const GROW_TEXT =
  "Whenever one or more creature cards are put into your graveyard from anywhere, put that many +1/+1 counters on this creature.";

export default defineCard({
  name: "Voracious Brood",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Alien", "Insect"],
  power: 1,
  toughness: 1,
  text: `${ENTERS_TEXT}\n${GROW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countInGraveyard: { type: "creature", ownedBy: "you" } } },
      },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you", filter: { type: "creature" }, batched: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});

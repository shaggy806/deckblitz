import { defineCard } from "../define.js";

// Commander 2019. Each player creates (and so owns) their own Plant (the
// ruling). Any creature token's death counts, each player's alike.
const END_TEXT = "At the beginning of your end step, each player creates a 1/1 green Plant creature token.";
const DIES_TEXT = "Whenever a creature token dies, put a +1/+1 counter on Grismold.";

export default defineCard({
  name: "Grismold, the Dreadsower",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Troll", "Shaman"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${END_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "1/1 Green Plant Token", count: 1, who: "each-player" },
      resolve: null,
      text: END_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { token: true, type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

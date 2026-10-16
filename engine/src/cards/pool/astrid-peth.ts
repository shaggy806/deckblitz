import { defineCard } from "../define.js";

const FOOD_TEXT = "Whenever Astrid Peth enters or attacks, create a Food token.";
const SKY_TEXT = "Brand-new Sky — Whenever you sacrifice a Clue or Food, Astrid Peth explores.";

export default defineCard({
  name: "Astrid Peth",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  text: `${FOOD_TEXT}\n${SKY_TEXT} (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD_TEXT,
    },
    {
      // Any Clue or Food artifact, not only tokens (the ruling); once per
      // permanent sacrificed.
      trigger: { on: "sacrifice", who: "you", filter: { subtypes: ["Clue", "Food"] } },
      targets: [],
      effect: { kind: "explore", target: "source" },
      resolve: null,
      text: SKY_TEXT,
    },
  ],
});

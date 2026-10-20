import { defineCard } from "../define.js";

const PT_TEXT =
  "Consuming Blob's power is equal to the number of card types among cards in your graveyard and its toughness is equal to that number plus 1.";
const END_TEXT =
  'At the beginning of your end step, create a green Ooze creature token with "This token\'s power is equal to the number of card types among cards in your graveyard and its toughness is equal to that number plus 1."';

export default defineCard({
  name: "Consuming Blob",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      // Tarmogoyf's shape over your own graveyard only.
      setBasePtFromCount: { countOf: { cardTypesInGraveyard: { ownedBy: "you" } }, plusPower: 0, plusToughness: 1 },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Ooze Token (Consuming Blob)", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});

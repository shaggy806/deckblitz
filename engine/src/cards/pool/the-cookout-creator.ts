import { defineCard } from "../define.js";

// Playtest card. "Tapped four untapped Humans you control" is a cost of tapping four Humans, this
// one among them if it's untapped; with no {T} symbol, summoning sickness doesn't stop it (rule 302.6).

const UPKEEP = "At the beginning of your upkeep, create a 1/1 colorless Human creature token for each Food you control.";
const TAP = "Tapped four untapped Humans you control: You draw a card and create a Treasure token.";

export default defineCard({
  name: "The Cookout Creator",
  manaCost: "{W}{B}{G}",
  colors: ["W", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Gamer"],
  power: 3,
  toughness: 3,
  text: `When The Cookout Creator enters, create a Food token.\n${UPKEEP}\n${TAP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "When The Cookout Creator enters, create a Food token.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Human Token (Colorless)",
        count: { countOf: { subtype: "Food", controlledBy: "you" } },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 4, filter: { subtype: "Human", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: TAP,
    },
  ],
});

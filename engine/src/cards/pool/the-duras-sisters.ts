import { defineCard } from "../define.js";

// EDHREC rank 31551.

const DIES_TEXT = "When The Duras Sisters die, create a 2/1 red Klingon Warrior creature token with haste.";

export default defineCard({
  name: "The Duras Sisters",
  manaCost: "{B/R}{B/R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 3,
  toughness: 2,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Klingon Warrior Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

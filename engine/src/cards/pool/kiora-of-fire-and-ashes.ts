import { defineCard } from "../define.js";

// EDHREC rank 24945.
// Makes Dragon → use "Dragon Token" (the 5/5 red flier).

const ENTER_TEXT = "When Kiora enters, create a 5/5 red Dragon creature token with flying.";
const MAKE_TEXT = "{8}: Create a 5/5 red Dragon creature token with flying.";

export default defineCard({
  name: "Kiora of Fire and Ashes",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Noble"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${MAKE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token", count: 1 },
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
});

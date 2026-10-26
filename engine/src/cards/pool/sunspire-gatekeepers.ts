import { defineCard } from "../define.js";

// EDHREC rank 27069.
//
// Gatekeeper: an intervening-if (Plaza of Harmony's condition), checked as it
// triggers and again as it resolves.

const TEXT =
  "When this creature enters, if you control two or more Gates, create a 2/2 white Knight creature token with vigilance.";

export default defineCard({
  name: "Sunspire Gatekeepers",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

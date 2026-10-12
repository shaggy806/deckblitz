import { defineCard } from "../define.js";

// EDHREC rank 13065.
// Makes Robot → use "Robot Token".

const TEXT =
  "At the beginning of your end step, if you control two or more tapped creatures, create a tapped 2/2 colorless Robot artifact creature token.";

export default defineCard({
  name: "Sami, Ship's Engineer",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      // Intervening-if (rule 603.4): asked as the step begins and again as it resolves.
      condition: { kind: "controls", filter: { type: "creature", tapped: true }, atLeast: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token", count: 1, tapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});

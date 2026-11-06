import { defineCard } from "../define.js";

// EDHREC rank 30353.
//
// No {T} in the cost, so any three untapped Faeries pay it — summoning-sick
// ones, and Q itself should it be a Faerie (rule 302.6).

const HOST_TEXT =
  "Tap three untapped Faeries you control: Exile cards from the top of your library until you exile a nonland " +
  "card. You may cast that card without paying its mana cost.";

export default defineCard({
  name: "Q, Your Illustrious Host",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Q"],
  power: 5,
  toughness: 5,
  text: HOST_TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 3, filter: { subtype: "Faerie", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"] },
        exile: true,
        rest: "stay",
        then: { kind: "cast-now", target: 0, free: true },
      },
      resolve: null,
      text: HOST_TEXT,
    },
  ],
});

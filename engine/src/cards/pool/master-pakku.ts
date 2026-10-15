import { defineCard } from "../define.js";

// EDHREC rank 11909. X is counted as the trigger resolves.

const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const MILL_TEXT =
  "Whenever Master Pakku becomes tapped, target player mills X cards, where X is the number of Lesson cards in your graveyard.";

export default defineCard({
  name: "Master Pakku",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor", "Ally"],
  power: 1,
  toughness: 3,
  text: `${PROWESS_TEXT}\n${MILL_TEXT} (They put the top X cards of their library into their graveyard.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: ["player"],
      effect: {
        kind: "mill",
        target: 0,
        amount: { countInGraveyard: { subtype: "Lesson", ownedBy: "you" } },
      },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});

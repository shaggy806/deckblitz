import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// "This creature or another Rogue": its own entry counts whatever its types
// then (`thisOrAnother`). The bonus is +2/+1 once, however many opponents
// have eight or more cards in their graveyards (its ruling).

const MILL_TEXT = "Whenever this creature or another Rogue you control enters, each opponent mills two cards.";
const STATIC_TEXT =
  "As long as an opponent has eight or more cards in their graveyard, this creature gets +2/+1 and has deathtouch.";

export default defineCard({
  name: "Thieves' Guild Enforcer",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${MILL_TEXT}\n${STATIC_TEXT}`,
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Rogue" } },
    targets: [],
    effect: { kind: "mill", target: "each-opponent", amount: 2 },
    resolve: null,
    text: MILL_TEXT,
  }),
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 },
      grantPt: [2, 1],
      grantKeywords: ["deathtouch"],
      text: STATIC_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Untargeted: which card is read as it resolves, and a tie is the controller's
// choice among the tied.
const TEXT =
  "When this creature enters, return to your hand the creature card in your graveyard with the greatest power. If two or more cards are tied for greatest power, you choose one of them.";

export default defineCard({
  name: "Desecrator Hag",
  manaCost: "{2}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Hag"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: { type: "creature", greatestInZone: { of: "power", among: { type: "creature" } } },
        destination: "hand",
        count: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

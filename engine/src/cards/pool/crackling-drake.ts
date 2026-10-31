import { defineCard } from "../define.js";

const POWER_TEXT =
  "Crackling Drake's power is equal to the total number of instant and sorcery cards you own in exile and in your graveyard.";
const ENTER_TEXT = "When this creature enters, draw a card.";

export default defineCard({
  name: "Crackling Drake",
  manaCost: "{U}{U}{R}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 0,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${POWER_TEXT}\n${ENTER_TEXT}`,
  static: [
    {
      // A characteristic-defining ability (rule 604.3), in every zone. A card
      // exiled face down has no characteristics and isn't counted (the
      // ruling).
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: {
          aggregate: "count",
          filter: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" },
          in: ["graveyards", "exile"],
        },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

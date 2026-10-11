import { defineCard } from "../define.js";

// EDHREC rank 14915.

const ENTERS_TEXT =
  "When this creature enters, you may search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.";
const DIES_TEXT = "When this creature dies, draw a card.";

export default defineCard({
  name: "Simulacrum Shaper",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { type: "land", supertype: "basic" },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

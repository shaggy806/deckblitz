import { defineCard } from "../define.js";

// EDHREC rank 7340. Modal double-faced; its back is Search for Blex. Several of
// the types still give the +1/+1 once (the ruling): one filter, `subtypes` an OR.

const ANTHEM_TEXT = "Other Pests, Bats, Insects, Snakes, and Spiders you control get +1/+1.";

export default defineCard({
  name: "Blex, Vexing Pest",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Pest"],
  power: 3,
  toughness: 2,
  text: `${ANTHEM_TEXT}\nWhen Blex dies, you gain 4 life.`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { subtypes: ["Pest", "Bat", "Insect", "Snake", "Spider"], controlledBy: "you" },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: "When Blex dies, you gain 4 life.",
    },
  ],
  faces: ["Blex, Vexing Pest", "Search for Blex"],
});

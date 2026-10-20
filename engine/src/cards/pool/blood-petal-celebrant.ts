import { defineCard } from "../define.js";

const FIRST_STRIKE_TEXT = "This creature has first strike as long as it's attacking.";
const DIES_TEXT =
  "When this creature dies, create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Blood Petal Celebrant",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 1,
  text: `${FIRST_STRIKE_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantKeywords: ["first-strike"],
      text: FIRST_STRIKE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

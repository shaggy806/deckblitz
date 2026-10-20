import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, create a 2/2 green Wolf creature token, a 3/3 green Beast creature token, and a 4/4 green Beast creature token.";
const TOKENS_TEXT = "Creature tokens you control have deathtouch.";

export default defineCard({
  name: "Somberwald Beastmaster",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 1,
  toughness: 1,
  text: `${ETB_TEXT}\n${TOKENS_TEXT} (Any amount of damage they deal to a creature is enough to destroy it.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // One instruction: the three tokens enter together.
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "create-token", token: "Wolf Token", count: 1 },
          { kind: "create-token", token: "3/3 Beast Token", count: 1 },
          { kind: "create-token", token: "Beast Token", count: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", tokenOnly: true },
      grantKeywords: ["deathtouch"],
      text: TOKENS_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 16663.
const DIES_TEXT =
  'When this creature dies, create two 1/1 black and green Pest creature tokens with "Whenever this token attacks, you gain 1 life."';

export default defineCard({
  name: "Pestbrood Sloth",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Sloth"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Pest Token (Attacks)", count: 2 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

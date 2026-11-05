import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 7122.
const ATTACK_TEXT =
  "Whenever Tamiyo attacks, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";
const DRAW_TEXT =
  "When you draw your third card in a turn, exile Tamiyo, then return her to the battlefield transformed under her owner's control.";

export default defineCard({
  name: "Tamiyo, Inquisitive Student",
  manaCost: "{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 0,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 3 },
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  faces: ["Tamiyo, Inquisitive Student", "Tamiyo, Seasoned Scholar"],
  transform: true,
});

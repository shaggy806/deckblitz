import { defineCard } from "../define.js";

const LIFE_TEXT = "Your opponents can't gain life.";
const DEVIL_TEXT =
  "−2: Create a 1/1 red Devil creature token with \"When this token dies, it deals 1 damage to any target.\"";

export default defineCard({
  name: "Tibalt, Rakish Instigator",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tibalt"],
  loyalty: 5,
  text: `${LIFE_TEXT}\n${DEVIL_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "opponent", prevent: true },
      text: LIFE_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Devil Token", count: 1 },
      resolve: null,
      text: DEVIL_TEXT,
    },
  ],
});

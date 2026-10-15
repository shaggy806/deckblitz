import { defineCard } from "../define.js";

// EDHREC rank 17615.

const ENTER_TEXT = "When Okoye enters, create two 1/1 white Soldier creature tokens.";
const STATIC_TEXT = "Attacking creature tokens you control have first strike.";

export default defineCard({
  name: "Okoye, Dora Milaje Leader",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true, attacking: true, controlledBy: "you" } },
      grantKeywords: ["first-strike"],
      text: STATIC_TEXT,
    },
  ],
});

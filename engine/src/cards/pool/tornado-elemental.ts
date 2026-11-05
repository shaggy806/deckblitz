import { defineCard } from "../define.js";

// EDHREC rank 18625.

const ENTERS_TEXT = "When this creature enters, it deals 6 damage to each creature with flying.";
const UNBLOCKED_TEXT = "You may have this creature assign its combat damage as though it weren't blocked.";

export default defineCard({
  name: "Tornado Elemental",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  text: `${ENTERS_TEXT}\n${UNBLOCKED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: 6 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, assignAsThoughUnblocked: true, text: UNBLOCKED_TEXT }],
});

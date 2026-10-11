import { defineCard } from "../define.js";

// EDHREC rank 16145. Marvel Super Heroes Commander.
//
// Zimone and Dina's "second card each turn" trigger with Diabolic Edict's
// targeted edict, narrowed to a nontoken creature (Sheoldred's Edict).
const TRIGGER_TEXT =
  "Whenever you draw your second card each turn, target opponent sacrifices a nontoken creature of their choice.";

export default defineCard({
  name: "M.O.D.O.K., Evil Intellect",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Villain"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: ["opponent"],
      effect: { kind: "sacrifice", who: "target", filter: { type: "creature", token: false }, count: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});

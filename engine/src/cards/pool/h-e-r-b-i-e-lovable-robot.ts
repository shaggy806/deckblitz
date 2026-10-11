import { defineCard } from "../define.js";

// EDHREC rank 10696.
//
// The intervening-if is a trigger condition (rule 603.4), asked as the step
// begins and again as it resolves (Eshki Dragonclaw's shape).
const COMBAT_TEXT = "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, surveil 1.";

export default defineCard({
  name: "H.E.R.B.I.E., Lovable Robot",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Scout"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${COMBAT_TEXT}\n{T}: Add {C}.\n{1}, {T}: Add one mana of any color.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{1}, {T}: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});

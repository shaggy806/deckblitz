import { defineCard } from "../define.js";

// EDHREC rank 19060.
//
// "Unless {G} was spent to cast it" reads the mana spent on the permanent's
// own spell: one that entered without being cast had none spent, and is
// sacrificed (the ruling).

const SHROUD_TEXT =
  "When this creature enters, creatures you control gain shroud until end of turn. (They can't be the targets of spells or abilities.)";
const SAC_TEXT = "When this creature enters, sacrifice it unless {G} was spent to cast it.";

export default defineCard({
  name: "Plaxmanta",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${SHROUD_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "shroud",
        duration: "end-of-turn",
      },
      resolve: null,
      text: SHROUD_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "source", filter: { manaSpentOfColors: { G: 1 } } } },
        then: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});

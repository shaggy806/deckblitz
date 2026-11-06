import { defineCard } from "../define.js";

// EDHREC rank 30796.
//
// Giada's "already" replacement: the count is read as each Faerie enters, never
// including it or anything entering alongside it (rule 614.12).

const FEDERATION_TEXT =
  "Federation — Faeries you control enter with an additional +1/+1 counter on them for each creature type among " +
  "non-Borg creatures you already control.";

/** Federation's count: the different creature types among your non-Borg creatures (a changeling counts every type). */
const FEDERATION_X = {
  aggregate: "distinct",
  of: { subtypesOf: "creature" },
  filter: { type: "creature", controlledBy: "you", notSubtypes: ["Borg"] },
} as const;

export default defineCard({
  name: "Jean-Luc, Mon Capitaine",
  manaCost: "{2}{U}{R}{W}",
  colors: ["U", "R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${FEDERATION_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { subtype: "Faerie", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: FEDERATION_X },
      },
      text: FEDERATION_TEXT,
    },
  ],
});

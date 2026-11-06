import { defineCard } from "../define.js";

// EDHREC rank 19622.
// "If you cast it" is an intervening if (rule 603.4): how it entered, which
// can't change while it stays.

const ENTER_TEXT = "When this creature enters, if you cast it, destroy all nonartifact creatures.";

export default defineCard({
  name: "Crystalline Entity",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { castBy: "you" } },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature", notTypes: ["artifact"] } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

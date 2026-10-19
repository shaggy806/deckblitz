import { defineCard } from "../define.js";

// EDHREC rank 29429.

const ETB_TEXT =
  "When this creature enters, if it was kicked, creatures you control gain menace until end of turn. (A creature with menace can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Bog Badger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Badger"],
  power: 3,
  toughness: 3,
  text: `Kicker {B} (You may pay an additional {B} as you cast this spell.)\n${ETB_TEXT}`,
  kicker: { cost: "{B}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "menace",
        duration: "end-of-turn",
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});

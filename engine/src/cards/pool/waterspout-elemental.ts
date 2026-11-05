import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, if it was kicked, return all other creatures to their owners' hands and you skip your next turn.";

export default defineCard({
  name: "Waterspout Elemental",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  kicker: { cost: "{U}" },
  text: `Kicker {U} (You may pay an additional {U} as you cast this spell.)\nFlying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-permanent",
            filter: { type: "creature" },
            exceptSource: true,
            simultaneous: true,
            effect: { kind: "return-to-hand", target: 0 },
          },
          { kind: "skip-turn", who: "you" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

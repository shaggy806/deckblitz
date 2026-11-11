import { defineCard } from "../define.js";

const CAST_TEXT =
  "When you do, you may cast target instant or sorcery card with mana value X from a graveyard without paying its mana cost. If that spell would be put into a graveyard, exile it instead.";
const ETB_TEXT = `When this creature enters, you may pay {X}. ${CAST_TEXT}`;

export default defineCard({
  name: "Halo Forager",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to cast an instant or sorcery card with mana value X from a graveyard?",
        cost: "{X}",
        effect: {
          kind: "reflexive-trigger",
          targets: [
            {
              kind: "card-in-graveyard",
              whose: "any",
              filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "eq", n: "x" } },
            },
          ],
          effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
          text: CAST_TEXT,
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});

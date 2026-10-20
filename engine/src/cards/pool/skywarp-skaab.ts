import { defineCard } from "../define.js";

// "You may exile two creature cards from your graveyard. If you do": the two are chosen as it
// resolves; fewer than two exiled (fewer creature cards there) isn't having done it (Aegis
// Sculptor's shape).

const ETB_TEXT =
  "When this creature enters, you may exile two creature cards from your graveyard. If you do, draw a card.";

export default defineCard({
  name: "Skywarp Skaab",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Drake"],
  power: 2,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile two creature cards from your graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "graveyard",
              filter: { type: "creature" },
              min: 2,
              max: 2,
              destination: "exile",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 2 },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});

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
      // With fewer cards in your graveyard than it exiles, "exile them" is an
      // impossible option, so it isn't offered (rule 608.2d): nothing is exiled.
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { type: "creature" } },
        then: {
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
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});

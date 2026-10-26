import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 24277.
//
// Asked as the trigger resolves (the second ruling), so a blue spell cast in
// response counts. Cast, this creature is itself one of the turn's blue
// spells, so another makes two; put onto the battlefield without being cast,
// any one blue spell is "another" (the first ruling — Slick Sequence's shape).

const TEXT = "When this creature enters, draw a card if you've cast another blue spell this turn.";

export default defineCard({
  name: "Dream Thief",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "any",
          of: [
            {
              kind: "all",
              of: [
                { kind: "source", filter: { cast: true } },
                { kind: "cast-this-turn", who: "you", filter: { colors: ["U"] }, atLeast: 2 },
              ],
            },
            {
              kind: "all",
              of: [
                { kind: "not", of: { kind: "source", filter: { cast: true } } },
                { kind: "cast-this-turn", who: "you", filter: { colors: ["U"] }, atLeast: 1 },
              ],
            },
          ],
        },
        then: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

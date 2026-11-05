import { defineCard } from "../define.js";

// Rulings: the token copies the printed card with the stated exceptions; an
// {X} in its cost is 0; its as-enters abilities work.

const TEXT =
  "At the beginning of combat on your turn, draw a card. Then you may exile an artifact or creature card from your hand. If you do, create a token that's a copy of the exiled card, except it's a 3/3 Golem artifact creature in addition to its other types.";

export default defineCard({
  name: "Nexus of Becoming",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            filter: { typesAnyOf: ["artifact", "creature"] },
            destination: "exile",
            unlinked: true,
            leftover: "stay",
            then: {
              kind: "create-token-copy",
              of: 0,
              count: 1,
              who: "you",
              asCard: true,
              exceptions: { addTypes: ["artifact", "creature"], addSubtypes: ["Golem"], basePt: [3, 3] },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

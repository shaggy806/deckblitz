import { defineCard } from "../define.js";

// EDHREC rank 12384.
//
// Rulings:
//   The cost increase applies to spells that player casts even if they're casting them for an
//     alternative cost. If they cast a spell without paying its mana cost, they'll still have to
//     pay {2}.
//   Abilities that reduce the cost to cast a spell apply after abilities that raise them.
//
// The drawing player's own effect (`each-player-may`: "you" in it is them),
// so the tax is a timed static of theirs — "spells you cast this turn cost
// {2} more", you included when it's your draw step — and only if they drew
// (a draw replaced is none).
const TEXT =
  "At the beginning of each player's draw step, that player may draw an additional card. If they do, spells they cast this turn cost {2} more to cast.";
const TAX = "Spells you cast this turn cost {2} more to cast.";

export default defineCard({
  name: "Academy Loremaster",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Draw an additional card? If you do, spells you cast this turn cost {2} more to cast.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "drawn", who: "you" },
              then: {
                kind: "timed-static",
                duration: "end-of-turn",
                static: [
                  { affects: { scope: "self" }, costModification: { applies: {}, increaseGeneric: 2, when: { caster: "you" } }, text: TAX },
                ],
                text: TAX,
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

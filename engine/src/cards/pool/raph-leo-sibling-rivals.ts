import { defineCard } from "../define.js";

// EDHREC rank 8612.
//
// Genji Glove's shape: "if it's the first combat phase of the turn" is an
// intervening if (`turn-structure`, asked on triggering and resolving), and
// the extra combat comes straight after this one. "One or two target
// attacking creatures" is an "any number" group of one to two, any player's.
const TEXT =
  "Whenever Raph & Leo attack, if it's the first combat phase of the turn, untap one or two target attacking creatures. After this phase, there is an additional combat phase.";

export default defineCard({
  name: "Raph & Leo, Sibling Rivals",
  manaCost: "{1}{R/W}{R/W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "turn-structure", combatPhase: 1 },
      targets: [
        {
          kind: "any-number",
          of: { kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } },
          min: 1,
          max: 2,
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "untap", target: 0 }, simultaneous: true },
          { kind: "additional-combat", afterThisPhase: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 371.
//
// Rulings:
//   [2024-06-07] If the mana generated with Arena of Glory's last ability is spent on two different
//     creature spells, each of those spells (and resulting creatures) will gain haste until end of
//     turn.
//   [2024-06-07] If mana generated with Arena of Glory's last ability is spent to cast a noncreature
//     spell that creates tokens, those tokens won't gain haste.
//   [2024-06-07] The mana generated with Arena of Glory's last ability can be spent on anything, not
//     just creature spells.
//   [2024-06-07] If mana generated with Arena of Glory's last ability is spent to pay any part of a
//     creature spell's cost, including an alternative or additional cost, that creature spell (and
//     the resulting creature) will gain haste until end of turn.
//   [2024-06-07] If mana generated with Arena of Glory's last ability is spent on a noncreature
//     spell that becomes a creature later in the turn, that creature won't have haste.
//   [2024-06-07] You must already control a Mountain as Arena of Glory enters the battlefield for it
//     to enter untapped.
//
// "If any of that mana": the rider rides on each unit (rule 106.6), so it holds
// for whichever spell each one goes on.

const ENTERS = "This land enters tapped unless you control a Mountain.";
const TAP = "{T}: Add {R}.";
const EXERT =
  "{R}, {T}, Exert this land: Add {R}{R}. If any of that mana is spent on a creature spell, it gains haste until end of turn.";

export default defineCard({
  name: "Arena of Glory",
  colors: [],
  types: ["land"],
  text: `${ENTERS}\n${TAP}\n${EXERT} (An exerted permanent won't untap during your next untap step.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "controls", filter: { subtype: "Mountain" }, atLeast: 1 },
      },
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: TAP,
    },
    {
      cost: { mana: "{R}", tap: true, do: { kind: "exert", target: "source" } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 2,
        spellGains: { spell: { type: "creature" }, keywords: ["haste"] },
      },
      resolve: null,
      text: EXERT,
    },
  ],
});

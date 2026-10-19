import { defineCard, type StaticAbility } from "../define.js";

// EDHREC rank 7636.
//
// Rulings:
//   [2022-09-09] If Stenn's controller activates its last ability during a player's end step,
//     the delayed triggered ability that returns it to the battlefield won't trigger until the
//     next time an end step begins, usually during the next player's turn.
//   [2022-09-09] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying (such as a flashback cost), add any cost increases (such as kicker
//     costs), then apply any cost reductions (such as that of Stenn's second ability). The mana
//     value of the spell is determined by only its mana cost, no matter what the total cost to
//     cast that spell was.
//   [2022-09-09] The cost reduction applies only to generic mana in the cost of spells you cast
//     of the chosen card type.
//
// Every card type a spell can have, other than creature and land (rule 300.1;
// the rest — dungeon, plane, … — are never spells, so choosing one reduces
// nothing). Cloud Key's shape: one reduction per type, live only for the type
// named as Stenn entered — asked again when it returns from its own exile.
const TYPES = ["artifact", "enchantment", "instant", "sorcery", "planeswalker", "battle", "kindred"] as const;

const reduction = (type: (typeof TYPES)[number]): StaticAbility => ({
  affects: { scope: "self" },
  condition: { kind: "chosen-on-enter", value: type },
  costModification: { applies: { type }, caster: "you", reduceGeneric: 1 },
  text: `Spells you cast of the chosen type (${type}) cost {1} less to cast.`,
});

const FLICKER_TEXT =
  "{1}{W}{U}: Exile Stenn. Return it to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Stenn, Paranoid Partisan",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text:
    "As Stenn enters, choose a card type other than creature or land.\n" +
    "Spells you cast of the chosen type cost {1} less to cast.\n" +
    FLICKER_TEXT,
  chooseOnEnter: [...TYPES],
  static: TYPES.map(reduction),
  activated: [
    {
      cost: { mana: "{1}{W}{U}", tap: false },
      targets: [],
      effect: {
        kind: "flicker",
        target: "source",
        returnAt: "next-end-step",
        returnText: "Return Stenn, Paranoid Partisan to the battlefield under its owner's control.",
      },
      resolve: null,
      text: FLICKER_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 11132.
//
// Rulings:
//   [2022-02-18] You must still pay all costs and follow all normal timing rules when playing a
//     card this way. For example, you may play a land this way only during one of your own main
//     phases while the stack is empty, and only if you haven't previously played a land this turn.
//
// Cait Sith, Fortune Teller's shape: the reflexive "when you exile a nonland
// card this way" (rule 603.12) is made only when the exiled card isn't a
// land, and carries that card's mana value as its X.

const SCRY_TEXT = "{B}, Sacrifice a creature: Scry 2.";
const EXILE_TEXT =
  "{2}{R}, {T}: Exile the top card of your library. You may play that card this turn. When you exile a nonland card this way, Hidetsugu deals damage equal to the exiled card's mana value to any target.";

export default defineCard({
  name: "Hidetsugu, Devouring Chaos",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ogre", "Demon"],
  power: 4,
  toughness: 4,
  text: `${SCRY_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: SCRY_TEXT,
    },
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { notTypes: ["land"] } },
            then: {
              kind: "reflexive-trigger",
              targets: ["any-target"],
              value: { thisWay: "exiled", sumOf: "mana-value" },
              effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
              text: "When you exile a nonland card this way, Hidetsugu deals damage equal to the exiled card's mana value to any target.",
            },
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});

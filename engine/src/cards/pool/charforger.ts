import { defineCard } from "../define.js";

// EDHREC rank 20919.
// Makes "Phyrexian Goblin Token".
//
// Rulings:
//   [2023-02-04] You must follow all normal timing rules for a card you play using
//     Charforger's last ability and, if it's a spell, you must pay its costs to cast it.

const ENTERS_TEXT = "When this creature enters, create a 1/1 red Phyrexian Goblin creature token.";
const OIL_TEXT =
  "Whenever another creature or artifact you control is put into a graveyard from the battlefield, put an oil counter on this creature.";
const EXILE_TEXT =
  "Remove three oil counters from this creature: Exile the top card of your library. You may play that card this turn.";

export default defineCard({
  name: "Charforger",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 2,
  toughness: 3,
  text: `${ENTERS_TEXT}\n${OIL_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "oil", count: 3 } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Goblin Token", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { typesAnyOf: ["creature", "artifact"] },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: OIL_TEXT,
    },
  ],
});

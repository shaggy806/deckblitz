import { defineCard } from "../define.js";

// EDHREC rank 11676.
// Dragon Mantle's granted activated ability: its `source` is the commander
// creature that has it.
//
// Rulings:
//   [2022-06-10] If you control a Background that grants an ability to commander creatures you
//     own, and you own more than one commander creature, each of them will have that ability.
//   [2022-06-10] If a card refers to a commander creature you own, a Background won't usually be
//     counted or included for that effect. If another spell or ability causes your Background to
//     become a creature, however, it will be included. Any effect that refers to your commander or
//     a commander you own or control without specifying creature will apply to a Background that
//     is your commander, as appropriate.

const GRANTED_TEXT = "{2}, Sacrifice an artifact: Put a +1/+1 counter on this creature and draw a card.";
const TEXT = `Commander creatures you own have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Clan Crafter",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false, sacrifice: { filter: { type: "artifact" } } },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
              { kind: "draw", amount: 1 },
            ],
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});

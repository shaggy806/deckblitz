import { defineCard } from "../define.js";

// EDHREC rank 28435. Throne of Eldraine.
//
// Rulings:
//   [2019-10-04] While resolving Wicked Guardian's triggered ability, you can't have it deal 2
//     damage multiple times or to multiple creatures to draw more cards.
//   [2019-10-04] If the damage Wicked Guardian deals is prevented (perhaps because you chose for
//     it to deal 2 damage to a creature with protection from black), you still draw a card.
//   [2019-10-04] No player may take actions between the time you choose which creature (if any)
//     is dealt damage and the time you draw a card if you chose one.
//
// Not a target: the creature is chosen as the trigger resolves (up to one,
// so none is "you may"), and the draw follows choosing one, whether or not
// the damage is prevented.

const ETB_TEXT =
  "When this creature enters, you may have it deal 2 damage to another creature you control. If you do, draw a card.";

export default defineCard({
  name: "Wicked Guardian",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 4,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        upTo: 1,
        min: 0,
        exceptSource: true,
        prompt: "Have Wicked Guardian deal 2 damage to another creature you control? If you do, draw a card.",
        then: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 2, target: 0 },
            { kind: "draw", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});

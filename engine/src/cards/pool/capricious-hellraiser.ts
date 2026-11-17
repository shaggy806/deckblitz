import { defineCard } from "../define.js";

// Rulings:
//   [2023-02-04] You cast the copy while the ability is resolving and still on the stack. You can't wait to cast it later in the turn.
//   [2023-02-04] The three cards you exile are chosen at random from among all cards in your graveyard. If all three cards you exile this way are creature and/or land cards, you won't be able to choose one of them to copy and cast.
//   [2023-02-04] If you don't want to cast the copy, you can choose not to; the copy ceases to exist the next time state-based actions are checked.
//
// The three leave the graveyard together (one "one or more cards leave your
// graveyard" event, rule 603.2c): `choose-random-card`'s `count` with a
// simultaneous `for-each-target`. The choice is of a card as it lies in exile
// (an adventurer creature card is a creature card there, rule 715.4), so it's
// a `look-and-choose` with a card filter, not `cast-now`'s `spell`.

const ETB_TEXT =
  "When this creature enters, exile three cards at random from your graveyard. Choose a noncreature, nonland card from among them and copy it. You may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Capricious Hellraiser",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `This spell costs {3} less to cast if you have nine or more cards in your graveyard.\nFlying\n${ETB_TEXT}`,
  selfCostReduction: {
    condition: { kind: "cards-in-graveyard", atLeast: 9 },
    reduceGeneric: 3,
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-random-card",
            zone: "graveyard",
            count: 3,
            then: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0 } },
          },
          {
            kind: "look-and-choose",
            zone: "exiled-this-way",
            filter: { notTypes: ["creature", "land"] },
            min: 1,
            max: 1,
            destination: "stay",
            leftover: "stay",
            prompt: "Choose a noncreature, nonland card to copy",
          },
          { kind: "cast-now", from: "chosen-this-way", copies: 1, free: true },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Rulings:
//   If a card is a copy of The Foretold Soldier on the battlefield, it can be exiled by the
//     triggered ability and will become foretold. However, it may only be cast this way if it has
//     a foretell cost in exile.
//   Regardless of who controlled The Foretold Soldier and exiled it with its triggered ability,
//     only its owner may cast it from exile this way.

const FORETELL = "Foretell {1}{G} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)";
const EXILE_TEXT = "Whenever this creature deals damage, exile it face down. It becomes foretold.";

export default defineCard({
  name: "The Foretold Soldier",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Alien", "Zombie", "Soldier"],
  power: 6,
  toughness: 6,
  text: `This creature must be blocked if able.\nThis creature can't be blocked by more than one creature.\n${EXILE_TEXT}\n${FORETELL}`,
  foretell: { cost: "{1}{G}" },
  static: [
    { affects: { scope: "self" }, restrictions: ["must-be-blocked-if-able"], text: "This creature must be blocked if able." },
    { affects: { scope: "self" }, blockedByAtMostOne: true, text: "This creature can't be blocked by more than one creature." },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      resolve: null,
      text: EXILE_TEXT,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "source" },
          { kind: "become-foretold", target: "exiled-this-way" },
        ],
      },
    },
  ],
});

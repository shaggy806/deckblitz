import { defineCard } from "../define.js";

// Rulings:
//   [2022-06-10] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2022-06-10] When the card returns to the battlefield, it will be a new object with no
//     connection to the card that was exiled. Auras attached to the exiled creature will be put
//     into their owners' graveyards. Any Equipment will become unattached and remain on the
//     battlefield. Any counters on the exiled creature will cease to exist.

const ENTER_TEXT = "When Oji enters, you gain 2 life and scry 2.";
const SECOND_TEXT =
  "Whenever you cast your second spell each turn, exile up to one target creature you control, then return it to the battlefield under its owner's control.";

export default defineCard({
  name: "Oji, the Exquisite Blade",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT}\n${SECOND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "scry", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "you", filter: { type: "creature" } } }],
      effect: { kind: "flicker", target: 0 },
      resolve: null,
      text: SECOND_TEXT,
    },
  ],
});

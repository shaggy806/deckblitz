import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 29077. Covetous Dragon's state trigger, with
// this creature left out of the count ("no other creatures"). Checked only as
// it triggers, not again on resolution (the ruling): a state trigger has no
// intervening "if".
//
// Rulings:
//   [2016-06-08] The ability only checks if you control no other creatures at the time it
//     triggers. It does not check again on resolution, so gaining control of a creature before
//     then will not save Emperor Crocodile.
//   [2016-06-08] Emperor Crocodile’s ability will trigger if you don’t control another creature,
//     even if it’s only for a brief moment during the resolution of another spell or ability (such
//     as that of Brago, King Eternal).

export default defineCard({
  name: "Emperor Crocodile",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Crocodile"],
  power: 5,
  toughness: 5,
  text: "When you control no other creatures, sacrifice this creature.",
  triggered: [
    {
      trigger: {
        on: "state",
        state: {
          kind: "not",
          of: { kind: "controls", filter: { type: "creature" }, atLeast: 1, excludeSelf: true },
        },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you control no other creatures, sacrifice this creature.",
    },
  ],
});

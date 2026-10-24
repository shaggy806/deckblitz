import { defineCard } from "../define.js";

// EDHREC rank 21658.
//
// Rulings:
//   [2016-07-13] If you transform Smoldering Werewolf into Erupting Dreadwolf after it has
//     attacked, Erupting Dreadwolf's triggered ability won't trigger that combat.
//
// Cast into the Fire's two different slots, dealt at once. The back face is
// Erupting Dreadwolf.
const ENTER_TEXT = "When this creature enters, it deals 1 damage to each of up to two target creatures.";

export default defineCard({
  name: "Smoldering Werewolf",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf", "Horror"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT}\n{4}{R}{R}: Transform this creature.`,
  activated: [
    {
      cost: { mana: "{4}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{4}{R}{R}: Transform this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "damage", amount: 1, target: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Smoldering Werewolf", "Erupting Dreadwolf"],
  transform: true,
});

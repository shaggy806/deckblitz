import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

const ENTER_TEXT = "When this creature enters, it deals 1 damage to each of up to two target creatures.";
const TRANSFORM_TEXT = "{4}{R}{R}: Transform this creature.";

export default defineCard({
  name: "Smoldering Werewolf",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf", "Horror"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(2, "creature", { optional: true }),
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
  activated: [
    {
      cost: { mana: "{4}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Smoldering Werewolf", "Erupting Dreadwolf"],
  transform: true,
});

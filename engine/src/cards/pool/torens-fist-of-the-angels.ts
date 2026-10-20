import { defineCard } from "../define.js";
import { training } from "../helpers.js";

// EDHREC rank 4521.
// Makes Human Soldier → "Human Soldier Token (Torens, Fist of the Angels)", the
// green and white one with training.

export default defineCard({
  name: "Torens, Fist of the Angels",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "Training (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)\nWhenever you cast a creature spell, create a 1/1 green and white Human Soldier creature token with training.",
  triggered: [
    training(),
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token (Torens, Fist of the Angels)", count: 1 },
      resolve: null,
      text: "Whenever you cast a creature spell, create a 1/1 green and white Human Soldier creature token with training.",
    },
  ],
});

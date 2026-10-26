import { defineCard } from "../define.js";

// EDHREC rank 30668.

const TEXT = "When this creature enters or leaves the battlefield, you lose 3 life if you don't control a Demon.";

// Not an intervening-if: the Demon check is made as each trigger resolves.
const LOSE_UNLESS_DEMON = {
  kind: "conditional",
  condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Demon" }, atLeast: 1 } },
  then: { kind: "lose-life", amount: 3 },
} as const;

export default defineCard({
  name: "Raving Oni-Slave",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: LOSE_UNLESS_DEMON,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: LOSE_UNLESS_DEMON,
      resolve: null,
      text: TEXT,
    },
  ],
});

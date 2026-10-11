import { defineCard } from "../define.js";

// EDHREC rank 15051.

const EMPOWER_TEXT =
  "When Way of the Necromancer enters, empower Jace 2. (Put two loyalty counters on a Jace token you control. " +
  "If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";
const DIES_TEXT = "Whenever a creature you control dies, put a loyalty counter on each planeswalker you control.";

export default defineCard({
  name: "Way of the Necromancer",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${EMPOWER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 2 },
      resolve: null,
      text: "When Way of the Necromancer enters, empower Jace 2.",
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "planeswalker", controlledBy: "you" },
        counter: "loyalty",
        amount: 1,
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

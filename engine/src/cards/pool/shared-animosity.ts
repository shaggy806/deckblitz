import { defineCard } from "../define.js";

const TEXT = "Whenever a creature you control attacks, it gets +1/+0 until end of turn for each other attacking creature that shares a creature type with it.";

// Any attacking creature, whoever controls it (the ruling's teammate); read as it
// resolves, a changeling sharing with anything that has a creature type.
export default defineCard({
  name: "Shared Animosity",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: {
          countOf: { type: "creature", attacking: true, sharesCreatureTypeWith: "trigger-object" },
          excludeTriggerObject: true,
        },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

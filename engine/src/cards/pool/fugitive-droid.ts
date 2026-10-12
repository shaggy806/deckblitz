import { defineCard } from "../define.js";

// EDHREC rank 11343.
//
// "If an artifact entered the battlefield under your control this turn" is
// Iron Man, Master of Machines' `turn-history` condition, here gating a
// static "can't be blocked". The counter's target is Rebuff the Wicked's
// spell filter: a spell with at least one target that's an artifact or
// creature you control (the rulings — one of several targets is enough), and
// a target that has left the battlefield no longer counts, while one that is
// merely an illegal target for that spell still does.
const UNBLOCKABLE =
  "This creature can't be blocked if an artifact entered the battlefield under your control this turn.";
const COUNTER = "{U}, Sacrifice this creature: Counter target spell that targets an artifact or creature you control.";

export default defineCard({
  name: "Fugitive Droid",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Scientist"],
  power: 1,
  toughness: 1,
  text: `${UNBLOCKABLE}\n${COUNTER}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "artifact" } },
      grantKeywords: ["unblockable"],
      text: UNBLOCKABLE,
    },
  ],
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "spell",
          filter: { targets: { permanent: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } } },
        },
      ],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: COUNTER,
    },
  ],
});

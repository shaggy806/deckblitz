import { defineCard } from "../define.js";

// EDHREC rank 26658.
//
// Rulings:
//   [2007-02-01] The second ability can be activated only if Molten Firebird is on the
//     battlefield.
//   [2007-02-01] The player who controlled Molten Firebird when it was put into a graveyard will
//     skip their next draw step even if Molten Firebird is returned to the battlefield under a
//     different player's control (because it's owned by someone else) or isn't returned to the
//     battlefield at all.

const DIES_TEXT =
  "When this creature dies, return it to the battlefield under its owner's control at the beginning of the next end step and you skip your next draw step.";
const EXILE_TEXT = "{4}{R}: Exile this creature.";

export default defineCard({
  name: "Molten Firebird",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // "You" is the trigger's controller — who controlled it as it died
      // (the ruling), whether or not it comes back.
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "put-onto-battlefield", target: "trigger-object" },
            text: "Return Molten Firebird to the battlefield under its owner's control.",
          },
          { kind: "skip-step", step: "draw", who: "you" },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [{ cost: { mana: "{4}{R}", tap: false }, targets: [], effect: { kind: "exile", target: "source" }, resolve: null, text: EXILE_TEXT }],
});

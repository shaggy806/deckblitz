import { defineCard } from "../define.js";

// EDHREC rank 10805.
//
// Rulings:
//   [2021-04-16] Abilities that trigger when something else causes an ability to trigger will
//     always go on the stack after the ability that caused them to trigger. For example, Strict
//     Proctor's ability will always resolve before the triggered ability that caused it to
//     trigger does. This is a change from previous rules.
//   [2021-04-16] Triggered abilities use the word "when," "whenever," or "at." They're often
//     written as "[Trigger condition], [effect]."
//   [2021-04-16] Effects that modify how a creature enters the battlefield are not triggered
//     abilities and are not affected by Strict Proctor's ability. These include (but aren't
//     limited to) effects that have a permanent enter the battlefield as a copy of another
//     permanent, effects that have a permanent enter with counters, and effects that have a
//     permanent enter tapped.
//
// The `entry-triggers-ability` event: any player's triggered ability whose
// trigger event was a permanent entering, as it goes on the stack — so this
// goes on above it and resolves first (rule 603.3b). "Its controller" is the
// ability's; "that ability" is the trigger object.
const PROCTOR =
  "Whenever a permanent entering causes a triggered ability to trigger, counter that ability unless its controller pays {2}.";

export default defineCard({
  name: "Strict Proctor",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${PROCTOR}`,
  triggered: [
    {
      trigger: { on: "event", event: "entry-triggers-ability" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: { controllerOf: "trigger-object" },
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "counter", target: "trigger-object" },
      },
      resolve: null,
      text: PROCTOR,
    },
  ],
});

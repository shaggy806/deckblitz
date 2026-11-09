import { defineCard } from "../define.js";

// EDHREC rank 15520.
//
// Rulings:
//   [2018-04-27] The set of Equipment to be destroyed is determined only as Corrosive Ooze’s
//     delayed triggered ability resolves at the end of combat. The Equipment will be destroyed
//     even if Corrosive Ooze leaves the battlefield before that time.
//   [2018-04-27] If the creature Corrosive Ooze blocks or is blocking leaves the battlefield, the
//     Equipment that was attached to that creature immediately before it left the battlefield will
//     be destroyed as Corrosive Ooze’s delayed triggered ability resolves at the end of combat.

export default defineCard({
  name: "Corrosive Ooze",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature blocks or becomes blocked by an equipped creature, destroy all Equipment attached to that creature at end of combat.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked", blocking: { equipped: true } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end-combat" },
        effect: { kind: "destroy-all", filter: { subtype: "Equipment", attachedToObject: "trigger-object" } },
        text: "Destroy all Equipment attached to that creature at end of combat.",
      },
      resolve: null,
      text: "Whenever this creature blocks or becomes blocked by an equipped creature, destroy all Equipment attached to that creature at end of combat.",
    },
    {
      trigger: { on: "blocked-by", who: "self", blocker: { equipped: true } },
      sameAbilityAs: 0,
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end-combat" },
        effect: { kind: "destroy-all", filter: { subtype: "Equipment", attachedToObject: "trigger-object" } },
        text: "Destroy all Equipment attached to that creature at end of combat.",
      },
      resolve: null,
      text: "Whenever this creature blocks or becomes blocked by an equipped creature, destroy all Equipment attached to that creature at end of combat.",
    },
  ],
});

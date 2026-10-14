import { defineCard } from "../define.js";

// EDHREC rank 2372.
//
// Rulings:
//   [2020-06-23] If a creature you control would enter the battlefield with a number of +1/+1
//     counters on it, it enters with that many plus one instead.
//   [2020-06-23] Conclave Mentor's first ability doesn't apply to itself if it's somehow entering
//     the battlefield with a +1/+1 counter on it.
//   [2020-06-23] If two or more effects attempt to modify how many counters would be put onto a
//     creature you control, you choose the order to apply those effects, no matter who controls
//     the sources of those effects.
//   [2020-06-23] Use Conclave Mentor's power as it last existed on the battlefield to determine
//     how much life you gain.
//   [2020-06-23] If you control two Conclave Mentors, the number of +1/+1 counters put on a
//     creature is two plus the original number. Three Conclave Mentors add three, and so on.

export default defineCard({
  name: "Conclave Mentor",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Centaur", "Cleric"],
  power: 2,
  toughness: 2,
  text: "If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on that creature instead.\nWhen this creature dies, you gain life equal to its power.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // Its power as it last existed on the battlefield (rule 608.2h).
      effect: { kind: "gain-life", amount: { powerOf: "source" } },
      resolve: null,
      text: "When this creature dies, you gain life equal to its power.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "+1/+1", filter: { type: "creature" } },
      text: "If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on that creature instead.",
    },
  ],
});

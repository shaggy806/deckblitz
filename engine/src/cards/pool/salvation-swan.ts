import { defineCard } from "../define.js";

// EDHREC rank 8286. Bloomburrow.
//
// "This creature or another Bird you control" is two triggers, the pool's
// shape for "this or another [type]", so it fires for itself even if it
// stopped being a Bird. The exile is S.H.I.E.L.D. Flying Car's delayed flicker, coming back
// with a flying counter on it as it enters (Parting Gust's `thenCounters`):
// a new object, its old counters and Auras gone; a token exiled this way
// never returns (the rulings).
const TEXT =
  "Whenever this creature or another Bird you control enters, exile up to one target creature you control without flying. Return it to the battlefield under its owner's control with a flying counter on it at the beginning of the next end step.";

const TARGETS = [
  {
    kind: "optional",
    of: { kind: "permanent", whose: "you", filter: { type: "creature", notKeyword: "flying" } },
  },
] as const;

const EFFECT = {
  kind: "flicker",
  target: 0,
  thenCounters: { kind: "flying", amount: 1, entering: true },
  returnAt: "next-end-step",
  returnText: "Return the exiled card to the battlefield under its owner's control with a flying counter on it.",
} as const;

export default defineCard({
  name: "Salvation Swan",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: TARGETS,
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", otherOnly: true, filter: { subtype: "Bird" } },
      targets: TARGETS,
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});

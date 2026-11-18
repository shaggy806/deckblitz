import { defineCard } from "../define.js";

// Kaldheim Commander. EDHREC rank 14354.
//
// Rulings:
//   Neither the second nor the third ability of Hero of Bretagard refers to a specific kind of
//     counter. Any counter that's on it will do.
//   Its triggered ability doesn't care which player is exiling the cards and permanents. Cards put
//     into exile from your hand for any reason, such as the foretell ability, cause the ability to
//     trigger, and permanents exiled from the battlefield cause it to trigger if you controlled the
//     spell or ability that exiled them.
//   Hero of Bretagard's triggered ability will trigger when a spell or ability you control exiles
//     any permanent, including token permanents and permanents you don't control.
//   With ten or more counters on it, Hero of Bretagard will have flying and indestructible, and it
//     will be an Angel and a God (and a Human and a Warrior, but those aren't as exciting).
//
// The trigger is one ability written as two entries (`sameAbilityAs`), as
// Ranar the Ever-Watchful's: one move doing both triggers it once, its "that
// many" every card and permanent the move counted (`addToMoveTrigger`).

const TRIGGER =
  "Whenever one or more cards are put into exile from your hand or a spell or ability you control exiles one or more permanents from the battlefield, put that many +1/+1 counters on this creature.";
const ANGEL = "As long as this creature has five or more counters on it, it has flying and is an Angel in addition to its other types.";
const GOD =
  "As long as this creature has ten or more counters on it, it has indestructible and is a God in addition to its other types.";

const COUNTERS = { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } } as const;

export default defineCard({
  name: "Hero of Bretagard",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: `${TRIGGER}\n${ANGEL}\n${GOD}`,
  triggered: [
    {
      trigger: { on: "put-into-exile", who: "you", from: ["hand"] },
      targets: [],
      effect: COUNTERS,
      resolve: null,
      text: TRIGGER,
    },
    {
      trigger: { on: "leaves-battlefield", who: "any", to: ["exile"], batched: true, byEffectOf: "you" },
      sameAbilityAs: 0,
      targets: [],
      effect: COUNTERS,
      resolve: null,
      text: TRIGGER,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", compare: { op: "gte", n: 5 } },
      addSubtypes: ["Angel"],
      grantKeywords: ["flying"],
      text: ANGEL,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", compare: { op: "gte", n: 10 } },
      addSubtypes: ["God"],
      grantKeywords: ["indestructible"],
      text: GOD,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 27760.
//
// Rulings:
//   [2022-09-09] If the target creature's power is greater than or equal to Vodalian Mindsinger's
//     power when the triggered ability resolves, it will be an illegal target for the ability, and
//     you will not gain control of it. Once the ability resolves, however, changing the power of
//     either creature will not end the control-changing effect.
//   [2022-09-09] You may kick Vodalian Mindsinger only once for its {1}{R} cost and only once for
//     its {1}{G} cost. You can kick it twice by paying {2}{R}{G}, but you can't kick it twice by
//     paying {2}{R}{R} or {2}{G}{G}. You can't kick it more than twice.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."

export default defineCard({
  name: "Vodalian Mindsinger",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Kicker {1}{R} and/or {1}{G}\nThis creature enters with two +1/+1 counters on it for each time it was kicked.\nWhen this creature enters, gain control of target creature with power less than this creature's power for as long as you control this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", filter: { type: "creature", power: { op: "lt", n: { amount: { powerOf: "source" } } } } },
      ],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      resolve: null,
      text: "When this creature enters, gain control of target creature with power less than this creature's power for as long as you control this creature.",
    },
  ],
  kicker: { cost: "{1}{R}", second: "{1}{G}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        // Kicked once or twice (rule 702.33d): two counters each time.
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "self-kicked", with: "both" },
            then: 4,
            else: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 },
          },
        },
      },
      text: "This creature enters with two +1/+1 counters on it for each time it was kicked.",
    },
  ],
});

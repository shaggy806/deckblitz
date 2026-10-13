import { defineCard } from "../define.js";

// EDHREC rank 4079.
//
// Rulings:
//   [2024-07-26] Each creature with lifelink dealing combat damage causes a separate life-gaining
//     event. For example, if two creatures you control with lifelink deal combat damage at the
//     same time, Essence Channeler’s second ability will trigger twice. However, if a single
//     creature you control with lifelink deals combat damage to multiple creatures, players,
//     planeswalkers, and/or battles at the same time (perhaps because it has trample or was
//     blocked by more than one creature), the ability will trigger only once.
//   [2024-07-26] In a Two-Headed Giant game, life gained by your teammate won’t cause Essence
//     Channeler’s second ability to trigger even though it caused your team’s life total to
//     increase.
//   [2024-07-26] If enough -1/-1 counters are put on Essence Channeler at the same time to make
//     its toughness 0 or less, its last ability will see all of the +1/+1 counters it had when it
//     died as well as the -1/-1 counters it had, and an equal number of each of those types of
//     counters (plus any other applicable counters) will be put onto the target creature.
//   [2024-07-26] If you gain an amount of life “for each” of something, that life is gained as one
//     event and Essence Channeler’s second ability triggers only once.
//   [2024-07-26] Once Essence Channeler has been blocked by a creature without flying or reach,
//     losing life to give it flying and vigilance won’t cause it to become unblocked.
//   [2024-07-26] Essence Channeler’s second ability triggers just once for each life-gaining
//     event, no matter how much life was gained.
//   [2024-07-26] Essence Channeler’s first ability cares whether you’ve lost life this turn, not
//     how your life total has changed. For example, if you’ve gained 2 life and lost 1 life so far
//     this turn, you’ve still lost life.
//   [2024-07-26] Essence Channeler’s last ability doesn’t cause you to move counters from Essence
//     Channeler onto the target creature. Rather, you put the same number of each kind of counter
//     Essence Channeler had when it died onto the target creature.
//   [2024-07-26] If Essence Channeler has -1/-1 counters on it when it dies, that ability will
//     include those as well. This may result in the recipient of the counters also dying.
//   [2024-07-26] In some unusual cases, you may end up putting the appropriate counters on more
//     than one permanent. For example, if you control The Ozolith when Essence Channeler dies,
//     you’ll put the appropriate number of each kind of counter onto both The Ozolith and the
//     target creature.
//   [2024-07-26] If Essence Channeler is dealt lethal damage at the same time that you gain life,
//     it won’t receive a counter from its second ability in time to save it.
//   [2024-07-26] Essence Channeler’s last ability puts all counters that were on Essence Channeler
//     onto the target creature, not just its +1/+1 counters.

export default defineCard({
  name: "Essence Channeler",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bat", "Cleric"],
  power: 2,
  toughness: 1,
  text: "As long as you've lost life this turn, this creature has flying and vigilance.\nWhenever you gain life, put a +1/+1 counter on this creature.\nWhen this creature dies, put its counters on target creature you control.",
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you gain life, put a +1/+1 counter on this creature.",
    },
    {
      // Each kind it died with, put on rather than moved (rule 122.8, the
      // ruling) — -1/-1 counters too.
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "put-counters-of", of: "source", target: 0 },
      resolve: null,
      text: "When this creature dies, put its counters on target creature you control.",
    },
  ],
  static: [
    {
      // Whether you've lost life this turn, not how your total has changed
      // (the ruling).
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "life-lost", who: "you", atLeast: 1 },
      grantKeywords: ["flying", "vigilance"],
      text: "As long as you've lost life this turn, this creature has flying and vigilance.",
    },
  ],
});

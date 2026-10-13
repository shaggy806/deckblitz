import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 7689.
//
// Rulings:
//   [2025-04-04] If enough -1/-1 counters are put on a creature you control at the same time to
//     make its toughness 0 or less, Host of the Hereafter’s last ability will see all of the +1/+1
//     counters it had when it died as well as the -1/-1 counters it had, and the same number of
//     each of those types of counters (plus any other applicable counters) will be put onto the
//     target creature.
//   [2025-04-04] If the creature that died had -1/-1 counters on it when it died, Host of the
//     Hereafter’s ability will put those on the target creature as well. This may result in the
//     recipient of the counters also dying.
//   [2025-04-04] Host of the Hereafter’s last ability puts all counters that were on the creature
//     that died onto the target creature, not just its +1/+1 counters.
//   [2025-04-04] Host of the Hereafter’s last ability doesn’t cause you to move counters from the
//     creature that died onto the target creature. Rather, you put the same number of each kind of
//     counter the creature had when it died onto the target creature.
//   [2025-04-04] If Host of the Hereafter dies at the same time as one or more other creatures you
//     control, Host of the Hereafter’s last ability triggers for each of those creatures that had
//     counters on them, including itself if applicable.
//   [2025-04-04] In some unusual cases, you may end up putting the appropriate counters on more
//     than one permanent. For example, if you control The Ozolith and Host of the Hereafter when a
//     creature you control with counters on it dies, you’ll put the appropriate number of each
//     kind of counter onto both The Ozolith and the target creature.

export default defineCard({
  name: "Host of the Hereafter",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Zombie", "Warlock"],
  power: 2,
  toughness: 2,
  text: "This creature enters with two +1/+1 counters on it.\nWhenever this creature or another creature you control dies, if it had counters on it, put its counters on up to one target creature you control.",
  triggered: [
    // Itself and every other creature you control (`thisOrAnother`), once
    // for each that died with counters (the rulings) — read as it died.
    // "Its counters" are each kind it had, put on rather than moved (rule
    // 122.8).
    ...thisOrAnother(
      {
        trigger: {
          on: "dies",
          who: "you-control",
          filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
        },
        targets: [{ kind: "optional", of: "creature-you-control" }],
        effect: { kind: "put-counters-of", of: "trigger-object", target: 0 },
        resolve: null,
        text: "Whenever this creature or another creature you control dies, if it had counters on it, put its counters on up to one target creature you control.",
      },
      { counters: { compare: { op: "gte", n: 1 } } },
    ),
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
  ],
});

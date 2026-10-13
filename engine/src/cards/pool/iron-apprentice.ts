import { defineCard } from "../define.js";

// EDHREC rank 6079.
//
// Rulings:
//   [2022-02-18] In some unusual cases, you may end up putting the counters on more than one
//     permanent. For example, if you control The Ozolith when Iron Apprentice dies, you will put
//     the appropriate number of each kind of counter onto both The Ozolith and the target
//     creature.
//   [2022-02-18] If Iron Apprentice has -1/-1 counters on it when it dies, the last ability will
//     include those as well. This may result in the recipient also dying.
//   [2022-02-18] Iron Apprentice puts all of its counters onto the target creature, not just its
//     +1/+1 counters.
//   [2022-02-18] Iron Apprentice's ability doesn't cause you to move counters from itself to the
//     target creature. Rather, you put the same number of each kind of counter Iron Apprentice had
//     when it died onto that creature.

export default defineCard({
  name: "Iron Apprentice",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 0,
  text: "This creature enters with a +1/+1 counter on it.\nWhen this creature dies, if it had counters on it, put those counters on target creature you control.",
  triggered: [
    {
      // "If it had counters on it" reads it as it died; "those counters" are
      // each kind it had, put on rather than moved (rule 122.8, the ruling).
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", compare: { op: "gte", n: 1 } },
      targets: ["creature-you-control"],
      effect: { kind: "put-counters-of", of: "source", target: 0 },
      resolve: null,
      text: "When this creature dies, if it had counters on it, put those counters on target creature you control.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "This creature enters with a +1/+1 counter on it.",
    },
  ],
});

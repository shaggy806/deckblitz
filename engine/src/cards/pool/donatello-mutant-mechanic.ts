import { defineCard } from "../define.js";

// EDHREC rank 13115.
//
// Rulings:
//   [2026-01-27] If the target artifact is an attached Equipment, it becomes unattached. If an
//     Equipment without reconfigure becomes an artifact creature, it can't be attached to another
//     creature.
//   [2026-01-27] Donatello's first ability doesn't remove any abilities the target artifact has.
//   [2026-01-27] If the target artifact has station, its base power and toughness will be set to
//     0/0. Adding charge counters to that artifact won't restore the power and toughness printed
//     in any of its striations.
//   [2026-01-27] The resulting artifact creature will be able to attack on your turn if it's been
//     under your control continuously since the turn began. That is, it doesn't matter how long
//     it's been a creature, just how long it's been on the battlefield.
//   [2026-01-27] The artifact retains any types, subtypes, or supertypes it has.
//   [2026-01-27] If the target artifact is a Vehicle, its base power and toughness will be set to
//     0/0. Crewing that Vehicle will not restore its power and toughness.

export default defineCard({
  name: "Donatello, Mutant Mechanic",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 3,
  toughness: 5,
  text: "{T}: Put three +1/+1 counters on target artifact you control. If it isn't a creature, it becomes a 0/0 Robot creature in addition to its other types. Activate only as a sorcery.\nWhenever an artifact you control is put into a graveyard from the battlefield, if it had counters on it, put those counters on up to one target artifact or creature you control.",
  activated: [
    {
      cost: { mana: null, tap: true },
      // Does Machines' level 3: the counters, then — if it isn't a creature
      // — a 0/0 Robot artifact creature for good, keeping its abilities and
      // other types (the rulings).
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { notTypes: ["creature"] } },
            then: {
              kind: "animate",
              target: 0,
              power: 0,
              toughness: 0,
              addTypes: ["creature"],
              addSubtypes: ["Robot"],
              duration: "permanent",
            },
          },
        ],
      },
      resolve: null,
      text: "{T}: Put three +1/+1 counters on target artifact you control. If it isn't a creature, it becomes a 0/0 Robot creature in addition to its other types. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      // "If it had counters on it" reads it as it last existed; "those
      // counters" are each kind it had, put on rather than moved (rule
      // 122.8).
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "artifact", counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } } }],
      effect: { kind: "put-counters-of", of: "trigger-object", target: 0 },
      resolve: null,
      text: "Whenever an artifact you control is put into a graveyard from the battlefield, if it had counters on it, put those counters on up to one target artifact or creature you control.",
    },
  ],
});

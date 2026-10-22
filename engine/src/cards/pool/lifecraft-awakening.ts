import { defineCard } from "../define.js";

// EDHREC rank 24974.
//
// "Becomes a 0/0 Construct artifact creature" keeps its other card types and
// subtypes but replaces any creature types (rule 205.1b), so Construct is a
// `setSubtypes` (which replaces only subtypes of its own kind) beside an added
// creature type, indefinitely (ruling).
//
// Rulings:
//   [2017-02-09] If the artifact isn't a creature or Vehicle as Lifecraft Awakening resolves, the
//     artifact becomes a creature indefinitely.
//   [2017-02-09] You can put +1/+1 counters on a noncreature Vehicle this way. They'll be put
//     there, apply if the Vehicle becomes a creature, and remain there when it stops being a
//     creature.
//   [2017-02-09] You can cast Lifecraft Awakening declaring X as 0. If the artifact isn't a
//     creature or Vehicle, it'll become a 0/0 creature and, unless another effect modifies its
//     toughness, be put into your graveyard soon after.
//   [2017-02-09] If an Equipment becomes a creature, it becomes unattached and it can't be
//     attached to a creature.

export default defineCard({
  name: "Lifecraft Awakening",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put X +1/+1 counters on target artifact you control. If it isn't a creature or Vehicle, it becomes a 0/0 Construct artifact creature.",
  targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { notTypes: ["creature"], notSubtypes: ["Vehicle"] } },
        then: {
          kind: "animate",
          target: 0,
          power: 0,
          toughness: 0,
          addTypes: ["artifact", "creature"],
          addSubtypes: [],
          setSubtypes: ["Construct"],
          duration: "permanent",
        },
      },
    ],
  },
});

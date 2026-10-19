import { defineCard } from "../define.js";

// EDHREC rank 24039.
//
// Rulings:
//   [2022-10-14] If an artifact or land that becomes a creature this way has been on the
//     battlefield since the beginning of your upkeep (even if it wasn't a creature at the time),
//     it can attack during your turn and its abilities may be activated.
//   [2022-10-14] Tawnos's Tinkering doesn't grant haste, so if a noncreature permanent that
//     entered the battlefield since the beginning of your upkeep becomes a creature this way, it
//     can't attack until your next turn.
//
// Donatello, Mutant Mechanic's counters-then-animate, with the untap between
// and no creature type added. The animation has no duration: it lasts as long
// as the permanent stays.
const TEXT =
  "Put two +1/+1 counters on target artifact, creature, or land you control. Untap that permanent. If it isn't a creature, it becomes a 0/0 creature in addition to its other types.";

export default defineCard({
  name: "Tawnos's Tinkering",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "untap", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { notTypes: ["creature"] } },
        then: {
          kind: "animate",
          target: 0,
          power: 0,
          toughness: 0,
          addTypes: ["creature"],
          addSubtypes: [],
          duration: "permanent",
        },
      },
    ],
  },
});

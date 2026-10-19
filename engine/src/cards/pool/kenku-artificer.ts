import { defineCard } from "../define.js";

// EDHREC rank 23208.
//
// Rulings:
//   [2022-06-10] If the target artifact is an attached Equipment, it becomes unattached. If an
//     Equipment without reconfigure becomes an artifact creature, it can't be attached to another
//     creature.
//   [2022-06-10] Kenku Artificer doesn't remove any abilities the target artifact has.
//   [2022-06-10] The resulting artifact creature will be able to attack on your turn if it's been
//     under your control continuously since the turn began. That is, it doesn't matter how long
//     it's been a creature, just how long it's been on the battlefield.
//   [2022-06-10] If the target noncreature artifact is a Vehicle, its power and toughness will be
//     set to 0/0. Crewing that Vehicle will not restore its power and toughness.
//   [2022-06-10] The artifact retains any types, subtypes, or supertypes it has.

const TEXT =
  "Homunculus Servant — When this creature enters, put three +1/+1 counters on up to one target noncreature artifact. That artifact becomes a 0/0 Homunculus artifact creature with flying.";

export default defineCard({
  name: "Kenku Artificer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Artificer"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } },
        },
      ],
      // No duration: it stays a creature for as long as it's on the
      // battlefield, keeping its abilities and other types (its rulings).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
          {
            kind: "animate",
            target: 0,
            power: 0,
            toughness: 0,
            addTypes: ["artifact", "creature"],
            addSubtypes: ["Homunculus"],
            keywords: ["flying"],
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

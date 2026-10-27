import { defineCard } from "../define.js";

// EDHREC rank 32079.
//
// Rulings:
//   [2006-09-25] If Durkwood Tracker has left the battlefield before the ability resolves, the
//     ability doesn't do anything. If the targeted creature has left the battlefield before the
//     ability resolves, the ability doesn't resolve.

export default defineCard({
  name: "Durkwood Tracker",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 4,
  toughness: 3,
  text: "{1}{G}, {T}: If this creature is on the battlefield, it deals damage equal to its power to target attacking creature. That creature deals damage equal to its power to this creature.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: { powerOf: "source" }, target: 0 },
            { kind: "fight", a: 0, b: "source", oneSided: true },
          ],
        },
      },
      resolve: null,
      text: "{1}{G}, {T}: If this creature is on the battlefield, it deals damage equal to its power to target attacking creature. That creature deals damage equal to its power to this creature.",
    },
  ],
});

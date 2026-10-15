import { defineCard } from "../define.js";

// EDHREC rank 20607.
//
// Super Villain Lockup's shape: an O-Ring exile (rule 610.3) and its linked
// return. If Henchbots has left before the exile resolves, nothing is exiled
// (the ruling).

const ENTERS_TEXT =
  "When this creature enters, exile target tapped creature an opponent controls until this creature leaves the battlefield.";

export default defineCard({
  name: "Henchbots",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 3,
  text: ENTERS_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", tapped: true } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      // The O-Ring's other half (rule 610.3): the exile's linked return.
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this creature leaves the battlefield, return the exiled card.",
    },
  ],
});

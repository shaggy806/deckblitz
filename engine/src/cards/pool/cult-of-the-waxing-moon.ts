import { defineCard } from "../define.js";

// EDHREC rank 13393.
//
// Rulings:
//   A permanent transforms into a non-Human creature if it transforms and is a creature without
//     the creature type Human after transforming, regardless of whether it was a Human creature
//     (or a creature at all) before it transformed.
//   A non-Human creature that's put onto the battlefield transformed will not cause the ability
//     to trigger.
//
// Norn's Inquisitor's `transforms` trigger: its filter reads the permanent as
// it is after turning over, and only a real transform emits the event — an
// entry already transformed never does.

const TRIGGER_TEXT =
  "Whenever a permanent you control transforms into a non-Human creature, create a 2/2 green Wolf creature token.";

export default defineCard({
  name: "Cult of the Waxing Moon",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 5,
  toughness: 4,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "transforms", who: "you-control", filter: { type: "creature", notSubtypes: ["Human"] } },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});

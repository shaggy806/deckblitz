import { defineCard } from "../define.js";

// EDHREC rank 24461.
//
// Rulings:
//   [2016-07-13] If the targeted creature is an illegal target when Somberwald Stag’s ability
//     tries to resolve, the ability doesn’t resolve. If Somberwald Stag is no longer on the
//     battlefield, the targeted creature won’t deal or be dealt damage.
//   [2016-07-13] You choose the target of the triggered ability as it goes on the stack, but you
//     choose whether or not to fight as that ability resolves.
//
// Affectionate Indrik's shape.
const TEXT = "When this creature enters, you may have it fight target creature you don't control.";

export default defineCard({
  name: "Somberwald Stag",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "may",
        prompt: "Have Somberwald Stag fight the target creature?",
        effect: { kind: "fight", a: "source", b: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 7013.
//
// Rulings:
//   [2024-07-26] If the target creature is an illegal target as Dreamdew Entrancer's last ability
//     tries to resolve, it won't resolve and none of its effects will happen. You won't put stun
//     counters on the creature, and you won't draw cards no matter who controls it.
//   [2024-07-26] You may target a creature that is already tapped with Dreamdew Entrancer's last
//     ability. If the target creature is already tapped as the ability resolves, you'll still put
//     three stun counters on it, and if you control it, you'll still draw two cards.

// With no target chosen there's no creature for "you control that creature",
// so nothing is drawn.
const ENTERS =
  "When this creature enters, tap up to one target creature and put three stun counters on it. If you control that creature, draw two cards.";

export default defineCard({
  name: "Dreamdew Entrancer",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Frog", "Wizard"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${ENTERS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { controlledBy: "you" } },
            then: { kind: "draw", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});

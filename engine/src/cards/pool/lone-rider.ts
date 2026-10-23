import { defineCard } from "../define.js";

// EDHREC rank 13246.
//
// Rulings:
//   [2016-07-13] Lone Rider's last ability triggers even if it wasn't on the battlefield when you
//     gained the life this turn.
//   [2016-07-13] You must have gained life before your end step begins. Lone Rider's last ability
//     won't trigger if you haven't, even if an ability triggering at the same time will cause you
//     to gain life.
//   [2016-07-13] Lone Rider's ability checks how much life you've gained during the turn, not what
//     your life total is compared to what it was when the turn began.
//
// "The end step" is every player's (The Gaffer's `who: "any"`), with Panicked
// Bystander's intervening-if on life gained this turn. The back face is It
// That Rides as One.
const END_TEXT = "At the beginning of the end step, if you gained 3 or more life this turn, transform this creature.";

export default defineCard({
  name: "Lone Rider",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike", "lifelink"],
  text: `First strike, lifelink\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 3 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: ["Lone Rider", "It That Rides as One"],
  transform: true,
});

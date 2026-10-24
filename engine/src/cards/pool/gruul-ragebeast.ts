import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 7682.
//
// Not optional; with no creature an opponent controls to target, it's removed
// from the stack. If either creature is gone or the target is illegal as it
// resolves, there's no fight (the rulings).
const TEXT =
  "Whenever this creature or another creature you control enters, that creature fights target creature an opponent controls.";

export default defineCard({
  name: "Gruul Ragebeast",
  manaCost: "{5}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "fight", a: "trigger-object", b: 0 },
      resolve: null,
      text: TEXT,
    }),
  ],
});

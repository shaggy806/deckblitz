import { defineCard } from "../define.js";

// One ability with two trigger events: two entries, the second naming the
// first (`sameAbilityAs`).
const TEXT =
  "When this creature enters or becomes the target of a spell or ability an opponent controls, you gain 3 life.";

export default defineCard({
  name: "Shield Mare",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 2,
  toughness: 3,
  text: `This creature can't be blocked by red creatures.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { colors: ["R"] },
      text: "This creature can't be blocked by red creatures.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});

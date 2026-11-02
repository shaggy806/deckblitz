import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters or dies, for each kind of counter on target permanent or player, give that permanent or player another counter of that kind.";

export default defineCard({
  name: "Maulfist Revolutionary",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["permanent-or-player"],
      effect: { kind: "another-counter-of-each-kind", target: 0 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["permanent-or-player"],
      effect: { kind: "another-counter-of-each-kind", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});

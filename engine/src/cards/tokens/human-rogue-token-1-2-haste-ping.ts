import { defineCard } from "../define.js";

const PING = "When this token enters, it deals 1 damage to any target.";

/** 1/2 red and white Human Rogue with haste and an enters ping (Outlaws' Merriment). */
export default defineCard({
  name: "1/2 Red and White Human Rogue Token (Haste, Ping)",
  art: "cd3ca6d5-4b2c-46d4-95f3-f0f2fa47f447",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${PING}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING,
    },
  ],
});

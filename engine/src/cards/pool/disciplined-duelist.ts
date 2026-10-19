import { defineCard } from "../define.js";

// EDHREC rank 23118.

export default defineCard({
  name: "Disciplined Duelist",
  manaCost: "{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 1,
  keywords: ["double-strike"],
  text: "Double strike\nThis creature enters with a shield counter on it. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "shield", amount: 1 } },
      text: "This creature enters with a shield counter on it.",
    },
  ],
});

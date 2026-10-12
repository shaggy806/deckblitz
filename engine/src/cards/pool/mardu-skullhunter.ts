import { defineCard } from "../define.js";

export default defineCard({
  name: "Mardu Skullhunter",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: "This creature enters tapped.\nRaid — When this creature enters, if you attacked this turn, target opponent discards a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: "Raid — When this creature enters, if you attacked this turn, target opponent discards a card.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
});

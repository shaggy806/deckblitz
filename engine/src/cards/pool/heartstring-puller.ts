import { defineCard } from "../define.js";

// EDHREC rank 30403.

export default defineCard({
  name: "Heartstring Puller",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elf", "Sorcerer"],
  power: 3,
  toughness: 1,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, create a 2/2 colorless Wizard Soldier creature token named Cadet.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Cadet", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 2/2 colorless Wizard Soldier creature token named Cadet.",
    },
  ],
});

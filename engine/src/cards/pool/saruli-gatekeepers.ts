import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, if you control two or more Gates, you gain 7 life.";

export default defineCard({
  name: "Saruli Gatekeepers",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 2 },
      targets: [],
      effect: { kind: "gain-life", amount: 7 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

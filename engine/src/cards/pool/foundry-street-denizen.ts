import { defineCard } from "../define.js";

export default defineCard({
  name: "Foundry Street Denizen",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  text: "Whenever another red creature you control enters, this creature gets +1/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", colors: ["R"] }, otherOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever another red creature you control enters, this creature gets +1/+0 until end of turn.",
    },
  ],
});

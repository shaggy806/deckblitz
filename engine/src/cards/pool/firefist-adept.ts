import { defineCard } from "../define.js";

export default defineCard({
  name: "Firefist Adept",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, it deals X damage to target creature an opponent controls, where X is the number of Wizards you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      // Counted as the ability resolves, this creature included if it's still there.
      effect: { kind: "damage", amount: { countOf: { subtype: "Wizard", controlledBy: "you" } }, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals X damage to target creature an opponent controls, where X is the number of Wizards you control.",
    },
  ],
});

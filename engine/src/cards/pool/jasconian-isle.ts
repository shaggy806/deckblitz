import { defineCard } from "../define.js";

// Blue by its color indicator (the ruling).
export default defineCard({
  name: "Jasconian Isle",
  colors: ["U"],
  types: ["land", "creature"],
  subtypes: ["Island", "Fish"],
  power: 3,
  toughness: 4,
  text: "(Jasconian Isle isn't a spell, it's affected by summoning sickness, it's blue, and it has \"{T}: Add {U}.\")\nJasconian Isle enters tapped.\nJasconian Isle doesn't untap during your untap step.\nAt the beginning of your upkeep, you may pay {U}{U}. If you do, untap Jasconian Isle.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {U}{U} to untap Jasconian Isle?",
        cost: "{U}{U}",
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may pay {U}{U}. If you do, untap Jasconian Isle.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "Jasconian Isle enters tapped.",
    },
    { affects: { scope: "self" }, doesntUntap: true, text: "Jasconian Isle doesn't untap during your untap step." },
  ],
});

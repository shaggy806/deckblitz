import { defineCard } from "../define.js";

// "The highest life total among all players" is read once, as the ability
// resolves (rule 608.2h), and every player's total becomes it (rule 119.5).
const TEXT = "When this creature enters, each player's life total becomes the highest life total among all players.";

export default defineCard({
  name: "Arbiter of Knollridge",
  manaCost: "{6}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Wizard"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "set-life-total", who: "each-player", amount: { amongPlayers: "greatest", of: { lifeTotal: "each" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});

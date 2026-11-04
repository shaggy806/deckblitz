import { defineCard } from "../define.js";

// A triggered mana ability (rule 605.1b): "if this creature is tapped" is read
// as the land is tapped, and the land's damage happens with the mana, off the
// stack (rule 605.4a).

const TEXT =
  "Whenever a player taps a land for mana, if this creature is tapped, that player adds one mana of any type that land produced. Then that land deals 1 damage to that player.";

export default defineCard({
  name: "Barbflare Gremlin",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Gremlin"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike", "haste"],
  text: `First strike, haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { type: "land" } },
      condition: { kind: "source", filter: { tapped: true } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "produced",
        amount: 1,
        also: { kind: "damage", amount: 1, who: "trigger-player", from: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

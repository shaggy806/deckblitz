import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 28728.

const UPKEEP =
  "At the beginning of your upkeep, if this card is in your graveyard, you may pay {1}{B}{B}. If you do, return it to your hand.";
const SAC = "{1}{R}{R}, Sacrifice this creature: It deals 2 damage to any target.";

export default defineCard({
  name: "Pyre Zombie",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  text: `${UPKEEP}\n${SAC}`,
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: SAC,
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{B}{B} to return Pyre Zombie to your hand?",
        cost: "{1}{B}{B}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});

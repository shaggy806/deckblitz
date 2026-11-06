import { defineCard } from "../define.js";

// EDHREC rank 28882.
// "That hasn't been chosen" is over this enchantment's whole time on the
// battlefield (`notChosenBefore`, Silent Hallcreeper's): the fourth upkeep
// leaves only Abandon Ship.

const UPKEEP_TEXT = "At the beginning of your upkeep, choose one that hasn't been chosen —";

export default defineCard({
  name: "Kobayashi Maru Scenario",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n• Hail — Return up to one target creature an opponent controls with mana value 3 or less to its owner's hand.\n• Sensors — Draw two cards.\n• Transport — Create two 1/1 red Officer creature tokens.\n• Abandon Ship — You lose the game.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Hail — Return up to one target creature an opponent controls with mana value 3 or less to its owner's hand.",
            targets: [
              {
                kind: "optional",
                of: {
                  kind: "permanent",
                  whose: "opponent",
                  filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
                },
              },
            ],
            effect: { kind: "return-to-hand", target: 0 },
          },
          { text: "Sensors — Draw two cards.", effect: { kind: "draw", amount: 2 } },
          {
            text: "Transport — Create two 1/1 red Officer creature tokens.",
            effect: { kind: "create-token", token: "Officer Token", count: 2 },
          },
          { text: "Abandon Ship — You lose the game.", effect: { kind: "lose-game" } },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});

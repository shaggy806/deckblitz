import { defineCard } from "../define.js";

// Star Trek Commander (TRC). The opponent is chosen at random as the ability
// resolves, after the draws; X is the greatest mana value among the revealed
// cards.

const TEXT =
  "{T}: Each player reveals the top card of their library, then draws a card. Alexander deals X damage to a random opponent, where X is the greatest mana value among cards revealed this way.";

export default defineCard({
  name: "Alexander, Ship's Fool",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Human"],
  power: 3,
  toughness: 5,
  keywords: ["vigilance", "haste"],
  text: `Vigilance, haste\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "reveal-top",
        who: "each-player",
        then: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1, who: "each-player" },
            {
              kind: "choose-opponent",
              random: true,
              then: {
                kind: "damage",
                amount: { thisWay: "revealed", greatestOf: "mana-value" },
                who: "that-player",
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

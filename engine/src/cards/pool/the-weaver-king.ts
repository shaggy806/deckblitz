import { defineCard } from "../define.js";

// Mystery Booster Commander. Not targeted: for each opponent you choose one
// creature card in their graveyard that went there from their library this
// turn (by this mill or anything earlier), and the cards enter together
// (`choicesHeld`). One is put if there is one — no "up to".
const TEXT =
  "Whenever The Weaver King deals combat damage to a player, they mill that many cards. Then for each opponent, put a creature card from that player's graveyard that was put there from their library this turn onto the battlefield under your control.";

export default defineCard({
  name: "The Weaver King",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Horror", "Wizard"],
  power: 3,
  toughness: 6,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "trigger-player", amount: { triggerValue: true } },
          {
            kind: "for-each-player",
            who: "each-opponent",
            choicesHeld: true,
            effect: {
              kind: "look-and-choose",
              from: "that-player",
              zone: "graveyard",
              min: 1,
              max: 1,
              filter: { type: "creature", putIntoGraveyardFromLibraryThisTurn: true },
              destination: "battlefield",
              under: "you",
              leftover: "stay",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

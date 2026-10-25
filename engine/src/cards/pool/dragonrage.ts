import { defineCard } from "../define.js";

// Both halves read the creatures attacking as it resolves (the ruling): the
// mana counts them, and only they gain the firebreathing ability.

const GRANTED_TEXT = "{R}: This creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Dragonrage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Add {R} for each attacking creature you control. Until end of turn, attacking creatures you control gain "${GRANTED_TEXT}"`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "add-mana",
        mana: "R",
        amount: { countOf: { type: "creature", controlledBy: "you", attacking: true } },
      },
      {
        kind: "grant-activated-all",
        filter: { type: "creature", controlledBy: "you", attacking: true },
        ability: {
          cost: { mana: "{R}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: GRANTED_TEXT,
        },
        duration: "end-of-turn",
      },
    ],
  },
});

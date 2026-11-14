import { defineCard } from "../define.js";

// EDHREC rank 16213. Each creature you control attacking a player (not a
// planeswalker or battle) gets +1/+0 for each creature *that* player — its
// own defending player — controls, counted as the ability resolves.
const BLOCK_TEXT = "Jurin must be blocked if able.";
const ATTACK_TEXT =
  "Whenever Jurin attacks, each creature you control attacking a player gets +1/+0 until end of turn for each creature that player controls.";

export default defineCard({
  name: "Jurin, Leading the Charge",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 4,
  toughness: 6,
  keywords: ["haste"],
  text: `Haste\n${BLOCK_TEXT}\n${ATTACK_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-be-blocked-if-able"], text: BLOCK_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature", controlledBy: "you", attackingPlayer: true },
        effect: {
          kind: "modify-pt",
          target: 0,
          power: { countOf: { type: "creature", controlledByRef: { defendingPlayerOf: 0 } } },
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

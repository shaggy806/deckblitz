import { defineCard } from "../define.js";
import { PARLEY_LAND, PARLEY_NONLAND, parley } from "../helpers.js";

// New Capenna Commander (NCC). EDHREC rank 10632.
export default defineCard({
  name: "Phabine, Boss's Confidant",
  manaCost: "{3}{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Cat", "Advisor"],
  power: 3,
  toughness: 6,
  text: "Creature tokens you control have haste.\nParley — At the beginning of combat on your turn, each player reveals the top card of their library. For each land card revealed this way, you create a 1/1 green and white Citizen creature token. Then creatures you control get +1/+1 until end of turn for each nonland card revealed this way. Then each player draws a card.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true, controlledBy: "you" } },
      grantKeywords: ["haste"],
      text: "Creature tokens you control have haste.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: parley(
        { kind: "create-token", token: "Citizen Token", count: PARLEY_LAND },
        {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: PARLEY_NONLAND,
          toughness: PARLEY_NONLAND,
          duration: "end-of-turn",
        },
      ),
      resolve: null,
      text: "Parley — At the beginning of combat on your turn, each player reveals the top card of their library. For each land card revealed this way, you create a 1/1 green and white Citizen creature token. Then creatures you control get +1/+1 until end of turn for each nonland card revealed this way. Then each player draws a card.",
    },
  ],
});

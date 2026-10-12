import { defineCard } from "../define.js";
import { saddle, saddleText } from "../helpers.js";
import type { EffectAmount } from "../../effects.js";

// "For the first time each turn": only when it wasn't saddled already
// (`firstTimeEachTurn`) — saddled lasts the turn, so a second saddling
// doesn't trigger it. X is counted as it resolves, after the mill (the
// ruling).
const SADDLED_TEXT =
  "Whenever this creature becomes saddled for the first time each turn, mill two cards, then this creature gets +X/+X until end of turn, where X is the number of creature cards in your graveyard.";
const X: EffectAmount = { countInGraveyard: { type: "creature", ownedBy: "you" } };

export default defineCard({
  name: "Stubborn Burrowfiend",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Badger", "Beast", "Mount"],
  power: 2,
  toughness: 2,
  text: `${SADDLED_TEXT}\n${saddleText(2)}`,
  triggered: [
    {
      trigger: { on: "becomes-saddled", who: "self", firstTimeEachTurn: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          { kind: "modify-pt", target: "source", power: X, toughness: X, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SADDLED_TEXT,
    },
  ],
  activated: [saddle(2, saddleText(2))],
});

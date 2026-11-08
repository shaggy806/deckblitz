import { defineCard } from "../define.js";

const ENTER_TEXT = "When Headliner Scarlett enters, creatures target player controls can't block this turn.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, exile the top card of your library face down. You may look at and play that card this turn.";

export default defineCard({
  name: "Headliner Scarlett",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "restrict",
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: 0,
        restrictions: ["cant-block"],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true, faceDown: true },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});

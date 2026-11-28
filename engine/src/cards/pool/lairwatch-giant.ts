import { defineCard } from "../define.js";

// EDHREC rank 29300. "Blocks two or more creatures" is a `blocks` trigger
// with `atLeast: 2`: at the declaration, or once an effect first takes it
// to two (the card's ruling).

const BLOCK_TEXT = "This creature can block an additional creature each combat.";
const STRIKE_TEXT = "Whenever this creature blocks two or more creatures, it gains first strike until end of turn.";

export default defineCard({
  name: "Lairwatch Giant",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 5,
  toughness: 3,
  text: `${BLOCK_TEXT}\n${STRIKE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: 1,
      text: BLOCK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "blocks", who: "self", atLeast: 2 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: STRIKE_TEXT,
    },
  ],
});

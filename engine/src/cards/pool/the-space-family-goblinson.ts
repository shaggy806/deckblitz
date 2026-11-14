import { defineCard } from "../define.js";

// Rulings:
//   [2022-10-07] If you roll more than one die at a time, however, that does count as multiple
//     die rolls.
//   [2022-10-07] If a die is rerolled, that counts only as a single roll. The original roll
//     doesn't count. Similarly, any die roll that's ignored doesn't count.

const TRAMPLE_TEXT =
  "The Space Family Goblinson has trample as long as you've rolled three or more dice this turn.";
const ROLL_TEXT = "Whenever you roll a die, put a +1/+1 counter on The Space Family Goblinson.";

export default defineCard({
  name: "The Space Family Goblinson",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Guest"],
  power: 1,
  toughness: 1,
  text: `${TRAMPLE_TEXT}\n${ROLL_TEXT}`,
  static: [
    {
      // Die by die, the dice kept alone (`diceRolledThisTurn`).
      affects: { scope: "self" },
      condition: { kind: "dice-rolled-this-turn", atLeast: 3 },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
  triggered: [
    {
      // Once per die rolled.
      trigger: { on: "event", event: "rolls-die", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
});

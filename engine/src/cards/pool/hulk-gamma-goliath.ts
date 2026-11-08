import { defineCard } from "../define.js";
import { powerUp } from "../helpers.js";

export default defineCard({
  name: "Hulk, Gamma Goliath",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gamma", "Berserker", "Hero"],
  power: 6,
  toughness: 5,
  keywords: ["reach", "trample"],
  text: "Reach, trample\nPower-up abilities of other creatures you control cost {3} less to activate.\nPower-up — {6}{R}{G}: Put five +1/+1 counters on Hulk. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)",
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: { type: "creature", controlledBy: "you", isSource: false }, abilityKind: "power-up", reduceGeneric: 3 },
      text: "Power-up abilities of other creatures you control cost {3} less to activate.",
    },
  ],
  activated: [
    powerUp(
      "{6}{R}{G}",
      { kind: "add-counter", target: "source", counter: "+1/+1", amount: 5 },
      "Power-up — {6}{R}{G}: Put five +1/+1 counters on Hulk. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)",
    ),
  ],
});

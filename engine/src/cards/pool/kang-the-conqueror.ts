import { defineCard } from "../define.js";
import { powerUp } from "../helpers.js";

export default defineCard({
  name: "Kang the Conqueror",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nPower-up — {5}{U}{U}{U}: Put a +1/+1 counter on Kang. Take an extra turn after this one. During that turn, power-up abilities can't be activated. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)",
  activated: [
    powerUp(
      "{5}{U}{U}{U}",
      {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "take-extra-turn", thatTurn: { noPowerUps: true } },
        ],
      },
      "Power-up — {5}{U}{U}{U}: Put a +1/+1 counter on Kang. Take an extra turn after this one. During that turn, power-up abilities can't be activated. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)",
    ),
  ],
});

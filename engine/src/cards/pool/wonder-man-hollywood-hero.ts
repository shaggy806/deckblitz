import { defineCard } from "../define.js";
import { powerUp } from "../helpers.js";

export default defineCard({
  name: "Wonder Man, Hollywood Hero",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Performer", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nEach power-up ability of permanents you control can be activated an additional time.\nPower-up — {5}{R}{R}: Put two +1/+1 counters on Wonder Man. (Activate each power-up ability only . . . once? Reduce the cost by his mana cost if he entered this turn.)",
  static: [
    {
      affects: { scope: "self" },
      additionalPowerUps: 1,
      text: "Each power-up ability of permanents you control can be activated an additional time.",
    },
  ],
  activated: [
    powerUp(
      "{5}{R}{R}",
      { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      "Power-up — {5}{R}{R}: Put two +1/+1 counters on Wonder Man. (Activate each power-up ability only . . . once? Reduce the cost by his mana cost if he entered this turn.)",
    ),
  ],
});

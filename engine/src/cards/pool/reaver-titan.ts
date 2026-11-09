import { crew } from "../helpers.js";
import { defineCard } from "../define.js";

const SHIELDS_TEXT = "Void Shields — Protection from mana value 3 or less";
const BLASTER_TEXT = "Gatling Blaster — Whenever this Vehicle attacks, it deals 5 damage to each opponent.";

export default defineCard({
  name: "Reaver Titan",
  manaCost: "{7}",
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 10,
  toughness: 10,
  text: `${SHIELDS_TEXT}\n${BLASTER_TEXT}\nCrew 4 (Tap any number of creatures you control with total power 4 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { manaValue: { op: "lte", n: 3 } } },
      text: SHIELDS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 5, who: "each-opponent" },
      resolve: null,
      text: BLASTER_TEXT,
    },
  ],
  activated: [crew(4)],
});

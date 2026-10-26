import { defineCard } from "../define.js";

const HASTE_TEXT = "This creature has haste as long as a Warrior card is in your graveyard.";
const PUMP_TEXT = "{R}: This creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Vengeful Firebrand",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 5,
  toughness: 2,
  text: `${HASTE_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Warrior" } },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// "Would deal damage": to anything, once (rule 609.7).

const TEXT = "{W}, Sacrifice this creature: The next time a black source of your choice would deal damage this turn, prevent that damage.";

export default defineCard({
  name: "Pilgrim of Virtue",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: `Protection from black\n${TEXT}`,
  static: [{ affects: { scope: "self" }, protection: { colors: ["B"] }, text: "Protection from black" }],
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", filter: { colors: ["B"] }, to: "any", amount: "next-time" },
      resolve: null,
      text: TEXT,
    },
  ],
});

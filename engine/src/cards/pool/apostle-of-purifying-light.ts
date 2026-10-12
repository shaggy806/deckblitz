import { defineCard } from "../define.js";

export default defineCard({
  name: "Apostle of Purifying Light",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: "Protection from black (This creature can't be blocked, targeted, dealt damage, enchanted, or equipped by anything black.)\n{2}: Exile target card from a graveyard.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{2}: Exile target card from a graveyard.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});

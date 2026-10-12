import { defineCard } from "../define.js";

export default defineCard({
  name: "Order of the White Shield",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  text: "Protection from black\n{W}: This creature gains first strike until end of turn.\n{W}{W}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W}: This creature gains first strike until end of turn.",
    },
    {
      cost: { mana: "{W}{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{W}{W}: This creature gets +1/+0 until end of turn.",
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

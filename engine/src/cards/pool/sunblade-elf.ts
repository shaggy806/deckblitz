import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 27353.

export default defineCard({
  name: "Sunblade Elf",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 1,
  toughness: 1,
  text: "This creature gets +1/+1 as long as you control a Plains.\n{4}{W}: Creatures you control get +1/+1 until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control a Plains.",
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{W}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{4}{W}: Creatures you control get +1/+1 until end of turn.",
    },
  ],
});

import { defineCard } from "../define.js";

const TEXT =
  "Domain — {3}: This creature gets +1/+0 until end of turn for each basic land type among lands you control.";

export default defineCard({
  name: "Wandering Goblins",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 0,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { basicLandTypes: "you" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

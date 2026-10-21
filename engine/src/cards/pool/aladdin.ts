import { defineCard } from "../define.js";

// EDHREC rank 22299.

export default defineCard({
  name: "Aladdin",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: "{1}{R}{R}, {T}: Gain control of target artifact for as long as you control this creature.",
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: true },
      targets: ["artifact"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      resolve: null,
      text: "{1}{R}{R}, {T}: Gain control of target artifact for as long as you control this creature.",
    },
  ],
});

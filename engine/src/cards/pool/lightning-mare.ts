import { defineCard } from "../define.js";

export default defineCard({
  name: "Lightning Mare",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Horse"],
  power: 3,
  toughness: 1,
  cantBeCountered: true,
  text: "This spell can't be countered.\nThis creature can't be blocked by blue creatures.\n{1}{R}: This creature gets +1/+0 until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { colors: ["U"] },
      text: "This creature can't be blocked by blue creatures.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
});

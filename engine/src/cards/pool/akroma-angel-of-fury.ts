import { defineCard } from "../define.js";

export default defineCard({
  name: "Akroma, Angel of Fury",
  manaCost: "{5}{R}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  cantBeCountered: true,
  morph: { keyword: "morph", cost: "{3}{R}{R}{R}" },
  text: "This spell can't be countered.\nFlying, trample, protection from white and from blue\n{R}: Akroma gets +1/+0 until end of turn.\nMorph {3}{R}{R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn her face up any time for her morph cost.)",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: Akroma gets +1/+0 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W", "U"] },
      text: "Protection from white and from blue",
    },
  ],
});

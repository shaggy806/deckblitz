import { defineCard } from "../define.js";

export default defineCard({
  name: "Shacklegeist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nThis creature can block only creatures with flying.\nTap two untapped Spirits you control: Tap target creature you don't control.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { subtype: "Spirit", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Tap two untapped Spirits you control: Tap target creature you don't control.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: "This creature can block only creatures with flying.",
    },
  ],
});

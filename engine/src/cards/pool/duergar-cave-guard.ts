import { defineCard } from "../define.js";

export default defineCard({
  name: "Duergar Cave-Guard",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 1,
  toughness: 3,
  keywords: ["wither"],
  text: "Wither (This deals damage to creatures in the form of -1/-1 counters.)\n{R/W}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{R/W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R/W}: This creature gets +1/+0 until end of turn.",
    },
  ],
});

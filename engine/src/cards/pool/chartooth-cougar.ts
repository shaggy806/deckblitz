import { defineCard } from "../define.js";

export default defineCard({
  name: "Chartooth Cougar",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 4,
  toughness: 4,
  cycling: { cost: "{2}", search: { subtype: "Mountain" } },
  text: "{R}: This creature gets +1/+0 until end of turn.\nMountaincycling {2} ({2}, Discard this card: Search your library for a Mountain card, reveal it, put it into your hand, then shuffle.)",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
});

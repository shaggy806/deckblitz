import { defineCard } from "../define.js";

export default defineCard({
  name: "Undulating Witness",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Flying\n{2}: This creature gets +1/-1 until end of turn.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{2}: This creature gets +1/-1 until end of turn.",
    },
  ],
});

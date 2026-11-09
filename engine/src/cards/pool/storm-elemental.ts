import { defineCard } from "../define.js";

// EDHREC rank 32215.
export default defineCard({
  name: "Storm Elemental",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{U}, Exile the top card of your library: Tap target creature with flying.\n{U}, Exile the top card of your library: If the exiled card is a snow land, this creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{U}", tap: false, do: { kind: "exile-from-library", amount: 1 } },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{U}, Exile the top card of your library: Tap target creature with flying.",
    },
    {
      cost: { mana: "{U}", tap: false, do: { kind: "exile-from-library", amount: 1 } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "object-matches", object: { paid: "exiled" }, filter: { type: "land", supertype: "snow" } },
        then: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: "{U}, Exile the top card of your library: If the exiled card is a snow land, this creature gets +1/+1 until end of turn.",
    },
  ],
});

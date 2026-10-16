import { defineCard } from "../define.js";

export default defineCard({
  name: "Hidden Courtyard",
  colors: [],
  types: ["land"],
  subtypes: ["Cave"],
  text: "This land enters tapped.\n{T}: Add {W}.\n{4}{W}, {T}, Sacrifice this land: Discover 4. Activate only as a sorcery. (Exile cards from the top of your library until you exile a nonland card with mana value 4 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: "{T}: Add {W}.",
    },
    {
      cost: { mana: "{4}{W}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "discover", amount: 4 },
      resolve: null,
      text: "{4}{W}, {T}, Sacrifice this land: Discover 4. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 9961.

export default defineCard({
  name: "Edgewall Inn",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\nAs this land enters, choose a color.\n{T}: Add one mana of the chosen color.\n{3}, {T}, Sacrifice this land: Return target card that has an Adventure from your graveyard to your hand.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of the chosen color.",
    },
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { hasAdventure: true } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "{3}, {T}, Sacrifice this land: Return target card that has an Adventure from your graveyard to your hand.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
});

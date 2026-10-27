import { defineCard } from "../define.js";

export default defineCard({
  name: "Sunken Citadel",
  colors: [],
  types: ["land"],
  subtypes: ["Cave"],
  text: "This land enters tapped. As it enters, choose a color.\n{T}: Add one mana of the chosen color.\n{T}: Add two mana of the chosen color. Spend this mana only to activate abilities of land sources.",
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of the chosen color.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      // "Land sources": a land in any zone, a land card in hand or a
      // graveyard included (the ruling — rule 109.2a).
      effect: {
        kind: "add-mana",
        mana: "chosen",
        amount: 2,
        spendOnly: {
          abilityOf: { type: "land" },
          abilityOfAnyZone: true,
          text: "Spend this mana only to activate abilities of land sources.",
        },
      },
      resolve: null,
      text: "{T}: Add two mana of the chosen color. Spend this mana only to activate abilities of land sources.",
    },
  ],
});

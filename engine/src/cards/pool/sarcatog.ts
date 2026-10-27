import { defineCard } from "../define.js";

export default defineCard({
  name: "Sarcatog",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Atog"],
  power: 1,
  toughness: 2,
  text: "Exile two cards from your graveyard: This creature gets +1/+1 until end of turn.\nSacrifice an artifact: This creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, exileFromGraveyard: { count: 2 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Exile two cards from your graveyard: This creature gets +1/+1 until end of turn.",
    },
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Sacrifice an artifact: This creature gets +1/+1 until end of turn.",
    },
  ],
});

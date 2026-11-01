import { defineCard } from "../define.js";

// Graveyard order (rule 404.2): `fromTop` with a filter, the first creature card down the pile.

const TEXT = "Exile the top creature card of your graveyard: This creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Necratog",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Atog"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" }, fromTop: true } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});

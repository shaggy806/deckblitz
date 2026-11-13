import { defineCard } from "../define.js";

// EDHREC rank 10918. Duskmourn Commander. The planar-dice replacement never
// applies: only a Planechase game has a planar die (rule 901.3), and this
// engine never plays one (Fractured Powerstone's roll does nothing). It stays
// in `text`; nothing else is needed for it to do exactly nothing (Susan Foreman).
const PLANAR_TEXT =
  "If you would roll one or more planar dice, instead roll that many planar dice plus one and ignore one.";

export default defineCard({
  name: "Ichor Elixir",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${PLANAR_TEXT}\n{T}: Add {C}{C}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 2 },
      resolve: null,
      text: "{T}: Add {C}{C}.",
    },
  ],
});

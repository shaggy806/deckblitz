import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 21250. Siren Song Lyre's granted ability, scrying.
const GRANTED = "{1}, {T}: Scry 1.";
const TEXT = `Equipped creature has "${GRANTED}" (To scry 1, look at the top card of your library, then you may put that card on the bottom.)`;

export default defineCard({
  name: "Witches' Eye",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {1}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: true },
          targets: [],
          effect: { kind: "scry", amount: 1 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{1}")],
});

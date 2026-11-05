import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 18017. "This creature" is the creature the ability was granted to.
const GRANTED = "Unattach Blinding Powder: Prevent all combat damage that would be dealt to this creature this turn.";
const TEXT = `Equipped creature has "${GRANTED}"`;

export default defineCard({
  name: "Blinding Powder",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: false, unattach: "granter" },
          targets: [],
          effect: { kind: "prevent-damage", target: "source", amount: "all", combatOnly: true },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{2}")],
});

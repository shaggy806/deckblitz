import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 14197. The creature deals the damage, its power read as the
// ability resolves; unattached, the Trident stays on the battlefield.
const GRANTED =
  "{T}, Unattach Surestrike Trident: This creature deals damage equal to its power to target player or planeswalker.";
const TEXT = `Equipped creature has first strike and "${GRANTED}"`;

export default defineCard({
  name: "Surestrike Trident",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["first-strike"],
      grantsActivated: [
        {
          cost: { mana: null, tap: true, unattach: "granter" },
          targets: ["player-or-planeswalker"],
          effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{4}")],
});

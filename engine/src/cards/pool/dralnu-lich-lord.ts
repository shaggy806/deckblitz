import { defineCard } from "../define.js";

// EDHREC rank 20169.
//
// The damage becomes the sacrifice (`instead: { effect }`, rules 614.1a, 614.6 —
// Lichenthrope's shape): no damage is dealt to Dralnu, so nothing that triggers on
// it sees any, and none is prevented, so damage that can't be prevented (615.12) is
// replaced all the same. "That many" is `"x"`, the damage; with fewer permanents
// than that, all of them go (the ruling), and Dralnu may be one (the ruling).
// The {T} ability is Sapphire Collector's `grant-flashback`.
//
// Rulings:
//   Dralnu may be one of the permanents you sacrifice while applying its replacement
//     effect.
//   If Dralnu would be dealt more damage than the number of permanents you control,
//     instead you sacrifice all permanents you control.

const DAMAGE_TEXT = "If damage would be dealt to Dralnu, sacrifice that many permanents instead.";
const FLASHBACK_TEXT =
  "{T}: Target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost. (You may cast that card from your graveyard for its flashback cost. Then exile it.)";

export default defineCard({
  name: "Dralnu, Lich Lord",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 3,
  toughness: 3,
  text: `${DAMAGE_TEXT}\n${FLASHBACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { effect: { kind: "sacrifice", who: "you", filter: {}, count: "x" } },
        to: "self",
      },
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["instant-or-sorcery-in-your-graveyard"],
      effect: { kind: "grant-flashback", target: 0 },
      resolve: null,
      text: FLASHBACK_TEXT,
    },
  ],
});

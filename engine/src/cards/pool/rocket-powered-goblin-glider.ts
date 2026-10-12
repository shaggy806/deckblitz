import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 10005.
//
// Rulings:
//   [2025-09-19] Mayhem represents an alternative cost that can be paid to cast a spell from your
//     graveyard if you discarded the card with mayhem that turn. You must pay any additional costs
//     the spell has.
//   [2025-09-19] You must follow all normal timing rules when casting a spell with mayhem. For
//     example, you can't cast a creature card with mayhem you couldn't normally cast during an
//     opponent's turn, even if you discard that card during an opponent's turn.

// "If it was cast from your graveyard" is the permanent's own cast record
// (Anti-Venom's `cast` filter): cast from a graveyard, and owned by the
// player it entered under — their graveyard, by mayhem or any other
// permission.
const ENTER_TEXT =
  "When this Equipment enters, if it was cast from your graveyard, attach it to target creature you control.";
const STATIC_TEXT = "Equipped creature gets +2/+0 and has flying and haste.";

export default defineCard({
  name: "Rocket-Powered Goblin Glider",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  mayhem: { cost: "{2}" },
  text: `${ENTER_TEXT}\n${STATIC_TEXT}\nEquip {2}\nMayhem {2}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "self",
        filter: { castFrom: "graveyard", ownedBy: "you" },
      },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantKeywords: ["flying", "haste"],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{2}")],
});

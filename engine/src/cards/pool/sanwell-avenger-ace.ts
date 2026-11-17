import { defineCard } from "../define.js";

// BRC. The prevention is a static replacement (rule 615.1) switched on while
// an artifact creature its controller controls is attacking — Sanwell itself
// included, should it be one (`countsSelf`; the first ruling). The six are
// exiled, not looked at; a Vehicle or artifact creature spell may be cast
// from among them as the trigger resolves, timing ignored but every cost paid
// (rule 608.2g; the second ruling), and the rest — the one not cast
// included — go to the bottom in a random order (the third ruling).
//
// Rulings:
//   [2022-10-14] If Sanwell, Avenger Ace is somehow an artifact creature, its first ability will
//     see itself while it is attacking.
//   [2022-10-14] You must pay all costs for a spell cast using Sanwell's last ability.
//   [2022-10-14] If you choose not to cast a spell this way, it goes to the bottom of the library
//     with the other exiled cards. You can't wait and cast it later.

const PREVENT_TEXT =
  "As long as an artifact creature you control is attacking, prevent all damage that would be dealt to Sanwell.";
const TAPPED_TEXT =
  "Whenever Sanwell becomes tapped, exile the top six cards of your library. You may cast a Vehicle or artifact creature spell from among them. Then put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Sanwell, Avenger Ace",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 3,
  toughness: 1,
  text: `${PREVENT_TEXT}\n${TAPPED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "controls",
        filter: { types: ["artifact", "creature"], attacking: true },
        atLeast: 1,
        countsSelf: true,
      },
      replacement: { event: "would-deal-damage", instead: { prevent: true }, to: "self" },
      text: PREVENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 6 },
          {
            kind: "cast-now",
            from: "exiled-this-way",
            spell: { anyOf: [{ subtype: "Vehicle" }, { types: ["artifact", "creature"] }] },
          },
          { kind: "move-exiled-this-way", to: "library-bottom" },
        ],
      },
      resolve: null,
      text: TAPPED_TEXT,
    },
  ],
});

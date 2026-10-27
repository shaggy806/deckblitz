import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 21940.
//
// Rulings:
//   [2004-12-01] The "enters" effect moves all Equipment onto the Battlemaster, regardless of
//     whether that Equipment was attached to other creatures.
//   [2004-12-01] If an Equipment can't equip Vulshok Battlemaster, it isn't attached to the
//     Battlemaster, and it doesn't become unattached (if it's attached to a creature).
//   [2004-12-01] Other players' Equipment is moved onto the Battlemaster as well as your own. This
//     doesn't change who controls the Equipment or who can activate its equip ability to move it
//     onto another creature.
//
// Balan's `attachments`, with no controller clause: every Equipment, each one
// that can't legally go there staying where it is (rule 701.3b).

const TEXT = "When this creature enters, attach all Equipment on the battlefield to it. (Control of the Equipment doesn't change.)";

export default defineCard({
  name: "Vulshok Battlemaster",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "attach", target: "source", attachments: { subtype: "Equipment" } },
      resolve: null,
      text: TEXT,
    },
  ],
});

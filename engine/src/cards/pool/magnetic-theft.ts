import { defineCard } from "../define.js";

// EDHREC rank 6777.
//
// Rulings:
//   [2004-12-01] Magnetic Theft can cause an Equipment one player controls to be attached to a
//     creature another player controls. The controller of the Equipment can pay the equip cost to
//     move the Equipment to a creature they control (but only any time that player could cast a
//     sorcery).
//
// Brass Squire's attach with neither target restricted to you: the Equipment
// keeps its controller, which needn't be the equipped creature's (rule
// 301.5d), and it moves only onto a creature it could equip (701.3a–b).
export default defineCard({
  name: "Magnetic Theft",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Attach target Equipment to target creature. (Control of the Equipment doesn't change.)",
  targets: [{ kind: "permanent", whose: "any", filter: { subtype: "Equipment" } }, "creature"],
  effect: { kind: "attach", target: 1, attachment: 0 },
});

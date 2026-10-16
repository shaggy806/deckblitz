import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Crafted, it enters as this face, so its own "when this Equipment enters"
// fires (Baseball Bat's attach).
export default defineCard({
  name: "Sovereign's Macuahuitl",
  art: "https://cards.scryfall.io/art_crop/back/d/1/d1d8d8ef-c8b2-4e7c-89e4-b381dff20584.jpg",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "When this Equipment enters, attach it to target creature you control.\nEquipped creature gets +2/+0.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: "When this Equipment enters, attach it to target creature you control.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
  activated: [equip("{2}")],
  faces: ["Idol of the Deep King", "Sovereign's Macuahuitl"],
  transform: true,
});

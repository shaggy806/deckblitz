import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Kaladesh (KLD). EDHREC rank 24091.
//
// Hero's Blade's attach: if the Artificer has left by then, the Goggles stay
// where they are (ruling).
const BONUS = "Equipped creature gets +1/+2.";
const ATTACH = "Whenever an Artificer you control enters, you may attach this Equipment to it.";

export default defineCard({
  name: "Inventor's Goggles",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${BONUS}\n${ATTACH}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: BONUS }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Artificer" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Attach Inventor's Goggles to it?",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: ATTACH,
    },
  ],
  activated: [equip("{2}")],
});

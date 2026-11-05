import { defineCard } from "../define.js";
import { equip, searchZonesAndOr } from "../helpers.js";

const ENTERS =
  "When this Equipment enters, you may search your library, hand, and/or graveyard for a Rune card and put it onto the battlefield attached to this Equipment. If you search your library this way, shuffle.";

export default defineCard({
  name: "Runed Crown",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\nEquipped creature gets +1/+1.\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library, hand, and/or graveyard for a Rune card?",
        effect: searchZonesAndOr(["library", "hand", "graveyard"], {
          kind: "search-library",
          filter: { subtype: "Rune" },
          destination: "battlefield",
          attachedToSource: true,
          min: 0,
          max: 1,
        }),
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [equip("{2}")],
});

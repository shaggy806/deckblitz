import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// The exiled creature and the found land enter as one event, and the creature
// comes back though no land is found (`alongExiledThisWay`).
const DAMAGE_TEXT =
  "Whenever equipped creature deals combat damage to a player, exile up to one target creature you own, then search your library for a basic land card. Put both cards onto the battlefield under your control, then shuffle.";

export default defineCard({
  name: "Sword of Hearth and Home",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +2/+2 and has protection from green and from white.\n${DAMAGE_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      protection: { colors: ["G", "W"] },
      text: "Equipped creature gets +2/+2 and has protection from green and from white.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", ownedBy: "you" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "search-library",
            filter: { type: "land", supertype: "basic" },
            destination: "battlefield",
            min: 0,
            max: 1,
            alongExiledThisWay: true,
          },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [equip("{2}")],
});

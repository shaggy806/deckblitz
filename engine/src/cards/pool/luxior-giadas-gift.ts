import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// "Equip planeswalker" (rule 702.6e): attached "as though that planeswalker
// were a creature", and then the second static makes it one, so it stays
// (704.5n). It has no P/T of its own, so it's 0/0 plus a +1/+1 for each counter
// on it, its loyalty counters included.

const BONUS = "Equipped creature gets +1/+1 for each counter on it.";
const BECOMES =
  "Equipped permanent isn't a planeswalker and is a creature in addition to its other types. (Loyalty abilities can still be activated.)";
const EQUIP_PLANESWALKER = "Equip planeswalker {1}";

export default defineCard({
  name: "Luxior, Giada's Gift",
  manaCost: "{1}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${BONUS}\n${BECOMES}\n${EQUIP_PLANESWALKER}\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { anyCountersOnAffected: true, pt: [1, 1] },
      text: BONUS,
    },
    {
      affects: { scope: "attached" },
      removeTypes: ["planeswalker"],
      addTypes: ["creature"],
      text: BECOMES,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "planeswalker" } }],
      effect: { kind: "attach", target: 0, planeswalkerToo: true },
      resolve: null,
      text: EQUIP_PLANESWALKER,
      sorcerySpeed: true,
    },
    equip("{3}"),
  ],
});

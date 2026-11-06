import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, look at the top five cards of your library. You may put a Klingon or Warrior creature card from among them onto the battlefield. Put the rest on the bottom of your library in a random order.";
const STATIC_TEXT = `Equipped creature gets +2/+2 and has "${ATTACK_TEXT}"`;

export default defineCard({
  name: "The Sword of Kahless",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "look-and-choose",
            zone: "library",
            count: 5,
            min: 0,
            max: 1,
            filter: { type: "creature", subtypes: ["Klingon", "Warrior"] },
            destination: "battlefield",
            leftover: "bottom-random",
          },
          resolve: null,
          text: ATTACK_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{2}")],
});

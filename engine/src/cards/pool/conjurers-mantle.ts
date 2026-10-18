import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 7922.
//
// "That creature" is the attacker, the trigger object: its creature types as
// it last existed if it has left (the ruling), bound by
// `sharesCreatureTypeWith`. Any card type may share one — a kindred card too —
// so the filter has no type clause.

const ATTACK_TEXT =
  "Whenever equipped creature attacks, look at the top six cards of your library. You may reveal a card that shares a creature type with that creature from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Conjurer's Mantle",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+1 and has vigilance.\n${ATTACK_TEXT}\nEquip {1}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["vigilance"],
      text: "Equipped creature gets +1/+1 and has vigilance.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { sharesCreatureTypeWith: "trigger-object" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [equip("{1}")],
});

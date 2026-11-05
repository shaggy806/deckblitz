import { defineCard } from "../define.js";

// "Each other legendary creature": other than the one getting the bonus
// (`relativeToAffected` with `excludeSelf`), counting this artifact only if
// it's a creature too (the ruling).

const PT_TEXT = "Each legendary creature you control gets +1/+1 for each other legendary creature you control.";
const LOOK_TEXT =
  "{X}, {T}: Look at the top X cards of your library. You may reveal a legendary creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Heroes' Podium",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${PT_TEXT}\n${LOOK_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", supertype: "legendary", controlledBy: "you" } },
      grantPtPerCount: {
        filter: { type: "creature", supertype: "legendary", controlledBy: "you" },
        relativeToAffected: true,
        excludeSelf: true,
        pt: [1, 1],
      },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: "x",
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature", supertype: "legendary" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});

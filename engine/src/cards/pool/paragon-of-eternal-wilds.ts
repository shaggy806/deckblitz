import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 19192.

const ANTHEM = "Other green creatures you control get +1/+1.";
const ACTIVATED = "{G}, {T}: Another target green creature you control gains trample until end of turn.";

export default defineCard({
  name: "Paragon of Eternal Wilds",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: `${ANTHEM}\n${ACTIVATED} (It can deal excess combat damage to the player or planeswalker it's attacking.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["G"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "creature", colors: ["G"] } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: ACTIVATED,
    },
  ],
});

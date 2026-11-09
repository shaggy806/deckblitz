import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 4140. Doubling Season's two Monks: you choose one (the ruling),
// which is why the host is picked among those created rather than named.
const STATIC_TEXT = "Equipped creature gets +1/+1 and has trample and haste.";
const FLURRY_TEXT =
  "Flurry — Whenever you cast your second spell each turn, create a 1/1 white Monk creature token with prowess. You may attach this Equipment to it. (Whenever you cast a noncreature spell, the token gets +1/+1 until end of turn.)";

export default defineCard({
  name: "Cori-Steel Cutter",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${FLURRY_TEXT}\nEquip {1}{R}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["trample", "haste"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Monk Token", count: 1 },
          {
            kind: "attach",
            target: { among: { thisWay: "created" }, prompt: "You may attach this Equipment to it", optional: true },
          },
        ],
      },
      resolve: null,
      text: FLURRY_TEXT,
    },
  ],
  activated: [equip("{1}{R}")],
});

import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const GRANTED_TEXT =
  "{2}, {T}: Other creatures you control gain trample and get +X/+X until end of turn, where X is this creature's power.";
const STATIC_TEXT = `Equipped creature has defender and "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Dragon Throne of Tarkir",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["defender"],
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: true },
          targets: [],
          // X is the creature's power as this resolves — its last-known power
          // if it's gone, and 0 if negative (the rulings; amounts clamp at 0).
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "grant-keyword-all",
                filter: { type: "creature", controlledBy: "you" },
                keyword: "trample",
                duration: "end-of-turn",
                exceptSource: true,
              },
              {
                kind: "modify-pt-all",
                filter: { type: "creature", controlledBy: "you" },
                power: { powerOf: "source" },
                toughness: { powerOf: "source" },
                duration: "end-of-turn",
                exceptSource: true,
              },
            ],
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{3}")],
});

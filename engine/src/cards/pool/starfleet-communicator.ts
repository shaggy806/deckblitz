import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Star Trek Commander (TRC). X is read as the granted trigger resolves, the
// equipped creature itself left out ("other creatures"), as Combadge's
// condition does; the same X caps the lands.

const CAST_TEXT = "When you cast this spell, copy it. (The copy becomes a token.)";
const GRANTED =
  "Whenever this creature attacks, draw X cards, then you may put up to X land cards from your hand onto the battlefield tapped, where X is the number of other creatures you control with a Communicator attached to them.";
const HAS_TEXT = `Equipped creature has "${GRANTED}"`;
const X = {
  countOf: { type: "creature", controlledBy: "you", attachments: { filter: { subtype: "Communicator" } } },
  excludeSelf: true,
} as const;

export default defineCard({
  name: "Starfleet Communicator",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Communicator", "Equipment"],
  text: `${CAST_TEXT}\n${HAS_TEXT}\nEquip {1}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: X },
              {
                kind: "look-and-choose",
                zone: "hand",
                min: 0,
                max: X,
                destination: "battlefield",
                enterTapped: true,
                leftover: "stay",
                filter: { type: "land" },
              },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: HAS_TEXT,
    },
  ],
  activated: [equip("{1}")],
});

import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const CAST_TEXT = "When you cast this spell, copy it. (The copy becomes a token.)";
const GRANTED =
  "Whenever this creature attacks while you control another creature with a Communicator attached to it, this creature can't be blocked this turn.";
const HAS_TEXT = `Equipped creature has "${GRANTED}"`;

export default defineCard({
  name: "Combadge",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Communicator", "Equipment"],
  text: `${CAST_TEXT}\n${HAS_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
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
          whileCondition: {
            kind: "controls",
            filter: { type: "creature", attachments: { filter: { subtype: "Communicator" } } },
            atLeast: 1,
            excludeSelf: true,
          },
          targets: [],
          effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: HAS_TEXT,
    },
  ],
  activated: [equip("{2}")],
});

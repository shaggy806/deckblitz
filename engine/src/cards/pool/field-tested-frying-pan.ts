import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 6822. The Food was created by the same ability, so the host is
// picked among the creatures created, never "the" token made.
const ENTER_TEXT =
  "When this Equipment enters, create a Food token, then create a 1/1 white Halfling creature token and attach this Equipment to it.";
const GRANTED_TEXT = "Whenever you gain life, this creature gets +X/+X until end of turn, where X is the amount of life you gained.";
const STATIC_TEXT = `Equipped creature has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Field-Tested Frying Pan",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${STATIC_TEXT}\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Food Token", count: 1 },
          { kind: "create-token", token: "Halfling Token", count: 1 },
          {
            kind: "attach",
            target: { among: { thisWay: "created", type: "creature" }, prompt: "Attach this Equipment to a Halfling" },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "gains-life", who: "you" },
          targets: [],
          effect: {
            kind: "modify-pt",
            target: "source",
            power: { triggerValue: true },
            toughness: { triggerValue: true },
            duration: "end-of-turn",
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{2}")],
});

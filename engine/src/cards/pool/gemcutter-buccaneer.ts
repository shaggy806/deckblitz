import { defineCard } from "../define.js";
import { equip, thisOrAnother } from "../helpers.js";

// EDHREC rank 5815. A Treasure is Equipment only while this is here (Armed
// with Proof): attached ones fall off as it leaves (rule 704.5p).
const ENTER_TEXT = "Whenever this creature or another Pirate you control enters, create a tapped Treasure token.";
const GRANTED_TEXT = "Equipped creature gets +2/+0";
const STATIC_TEXT = `Treasures you control are Equipment in addition to their other types and have "${GRANTED_TEXT}," equip Pirate {1}, and equip {3}.`;

export default defineCard({
  name: "Gemcutter Buccaneer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate", "Artificer"],
  power: 1,
  toughness: 3,
  text: `${ENTER_TEXT}\n${STATIC_TEXT}`,
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Pirate" } },
    targets: [],
    effect: { kind: "create-token", token: "Treasure Token", count: 1, tapped: true },
    resolve: null,
    text: ENTER_TEXT,
  }),
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Treasure", controlledBy: "you" } },
      addSubtypes: ["Equipment"],
      grantsStatic: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: GRANTED_TEXT }],
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false },
          targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Pirate" } }],
          effect: { kind: "attach", target: 0 },
          resolve: null,
          text: "Equip Pirate {1}",
          sorcerySpeed: true,
        },
        equip("{3}"),
      ],
      text: STATIC_TEXT,
    },
  ],
});

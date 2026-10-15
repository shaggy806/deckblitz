import { defineCard } from "../define.js";

// EDHREC rank 26006. Origin of Captain America's Sturdy Shield token, then
// "attach it to U.S.Agent": the Shield this ability created (each of them, if
// a replacement made more), onto him only while he's still the same object
// (rule 400.7) — otherwise it stays unattached.
const ETB_TEXT =
  "When U.S.Agent enters, create a colorless Equipment artifact token named Sturdy Shield with \"Equipped creature gets +1/+2\" and equip {2}. Attach it to U.S.Agent.";

export default defineCard({
  name: "U.S.Agent, John Walker",
  manaCost: "{3}{W/B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 3,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Sturdy Shield Token", count: 1 },
          { kind: "attach", target: "source", attachments: { subtype: "Equipment", thisWay: "created" } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});

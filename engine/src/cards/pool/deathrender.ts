import { defineCard } from "../define.js";

const DIES_TEXT =
  "Whenever equipped creature dies, you may put a creature card from your hand onto the battlefield and attach this Equipment to it.";

export default defineCard({
  name: "Deathrender",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +2/+2.\n${DIES_TEXT}\nEquip {2}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      // The chosen card is `then`'s target 0; `attach` moves this Equipment
      // onto it only if it can legally be equipped (the ruling: otherwise the
      // creature still enters and Deathrender stays unattached).
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
        then: { kind: "attach", target: 0 },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Equipped creature gets +2/+2." }],
});

import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Rulings:
//   [2021-07-23] When the equipped creature attacks alone, it causes both abilities to trigger.

const DEATHTOUCH_TEXT = "Whenever equipped creature attacks, it gains deathtouch until end of turn.";
const DRAIN_TEXT = "Whenever equipped creature attacks alone, defending player loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Reaper's Talisman",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${DEATHTOUCH_TEXT}\n${DRAIN_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: DEATHTOUCH_TEXT,
    },
    {
      trigger: { on: "attacks-alone", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "trigger-player", amount: 2 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
  activated: [equip("{2}")],
});

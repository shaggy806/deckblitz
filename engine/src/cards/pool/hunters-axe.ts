import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 23669.
//
// "Your choice of trample or deathtouch" is chosen as the granted trigger
// resolves (a `modal` effect, Assassin Initiate's shape) — the trigger has
// no modes of its own.
const ATTACK_TEXT = "Whenever this creature attacks, it gains your choice of trample or deathtouch until end of turn.";
const PUMP_TEXT = `Equipped creature gets +2/+0 and has "${ATTACK_TEXT}"`;

export default defineCard({
  name: "Hunter's Axe",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              {
                text: "Trample",
                effect: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
              },
              {
                text: "Deathtouch",
                effect: { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
              },
            ],
          },
          resolve: null,
          text: ATTACK_TEXT,
        },
      ],
      text: PUMP_TEXT,
    },
  ],
  activated: [equip("{2}")],
});

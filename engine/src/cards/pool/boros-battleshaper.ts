import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "At the beginning of each combat, up to one target creature attacks or blocks this combat if able and up to one target creature can't attack or block this combat.";

export default defineCard({
  name: "Boros Battleshaper",
  manaCost: "{5}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Soldier"],
  power: 5,
  toughness: 5,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: "creature" },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["must-attack", "must-block"], duration: "until-end-of-combat" },
          { kind: "restrict", target: 1, restrictions: ["cant-attack", "cant-block"], duration: "until-end-of-combat" },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});

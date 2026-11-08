import { defineCard } from "../define.js";

const STATIC_TEXT = "Cowards can't block Warriors.";
const COWARD_TEXT = "{R}: Target creature becomes a Coward until end of turn.";
const WARRIOR_TEXT = "{2}{R}: Target creature becomes a Warrior until end of turn.";

export default defineCard({
  name: "Boldwyr Intimidator",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 5,
  toughness: 5,
  text: `${STATIC_TEXT}\n${COWARD_TEXT}\n${WARRIOR_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Warrior" } },
      restrictions: [{ kind: "cant-be-blocked", by: { subtype: "Coward" } }],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Coward"], duration: "end-of-turn" },
      resolve: null,
      text: COWARD_TEXT,
    },
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Warrior"], duration: "end-of-turn" },
      resolve: null,
      text: WARRIOR_TEXT,
    },
  ],
});

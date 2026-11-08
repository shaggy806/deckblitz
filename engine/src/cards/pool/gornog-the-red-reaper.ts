import { defineCard } from "../define.js";

// "Becomes a Coward" replaces its creature types (rule 205.1b), for good.
// Once per player attacked by one or more Warriors you control, the target
// one of that player's creatures.
const CANT_BLOCK = "Cowards can't block Warriors.";
const ATTACK = "Whenever one or more Warriors you control attack a player, target creature that player controls becomes a Coward.";
const PUMP = "Attacking Warriors you control get +X/+0, where X is the number of Cowards your opponents control.";

export default defineCard({
  name: "Gornog, the Red Reaper",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 2,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${CANT_BLOCK}\n${ATTACK}\n${PUMP}`,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "you", defender: "any", filter: { subtype: "Warrior" } },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Coward"], duration: "permanent" },
      resolve: null,
      text: ATTACK,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Warrior" } },
      restrictions: [{ kind: "cant-be-blocked", by: { subtype: "Coward" } }],
      text: CANT_BLOCK,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Warrior", controlledBy: "you", attacking: true } },
      grantPtPerCount: { filter: { subtype: "Coward", controlledBy: "opponent" }, pt: [1, 0] },
      text: PUMP,
    },
  ],
});

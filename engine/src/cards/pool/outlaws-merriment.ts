import { defineCard } from "../define.js";

// The mode is chosen at random as the trigger goes on the stack, so players can
// respond knowing which token it makes (the ruling) — `modal`'s `announced`
// `random`.
const UPKEEP =
  "At the beginning of your upkeep, choose one at random. Create a red and white creature token with those characteristics.";
const WARRIOR = "3/1 Human Warrior with trample and haste.";
const CLERIC = "2/1 Human Cleric with lifelink and haste.";
const ROGUE = '1/2 Human Rogue with haste and "When this token enters, it deals 1 damage to any target."';

export default defineCard({
  name: "Outlaws' Merriment",
  manaCost: "{1}{R}{W}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  text: `${UPKEEP}\n• ${WARRIOR}\n• ${CLERIC}\n• ${ROGUE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        random: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: WARRIOR, effect: { kind: "create-token", token: "3/1 Red and White Human Warrior Token (Trample, Haste)", count: 1 } },
          { text: CLERIC, effect: { kind: "create-token", token: "2/1 Red and White Human Cleric Token (Lifelink, Haste)", count: 1 } },
          { text: ROGUE, effect: { kind: "create-token", token: "1/2 Red and White Human Rogue Token (Haste, Ping)", count: 1 } },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});

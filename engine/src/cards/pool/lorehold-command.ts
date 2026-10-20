import { defineCard } from "../define.js";

const SPIRIT_MODE = "Create a 3/2 red and white Spirit creature token.";
const PUMP_MODE = "Creatures you control get +1/+0 and gain indestructible and haste until end of turn.";
const BURN_MODE = "Lorehold Command deals 3 damage to any target. Target player gains 3 life.";
const SAC_MODE = "Sacrifice a permanent, then draw two cards.";

export default defineCard({
  name: "Lorehold Command",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: `Choose two —\n• ${SPIRIT_MODE}\n• ${PUMP_MODE}\n• ${BURN_MODE}\n• ${SAC_MODE}`,
  // The chosen modes resolve in printed order (the ruling): a Spirit made by
  // the first mode gets the second's pump, and the fourth can sacrifice it.
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: SPIRIT_MODE,
        effect: { kind: "create-token", token: "Spirit Token (Red-White)", count: 1 },
      },
      {
        text: PUMP_MODE,
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt-all",
              filter: { type: "creature", controlledBy: "you" },
              power: 1,
              toughness: 0,
              duration: "end-of-turn",
            },
            {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              keyword: "indestructible",
              duration: "end-of-turn",
            },
            {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              keyword: "haste",
              duration: "end-of-turn",
            },
          ],
        },
      },
      {
        text: BURN_MODE,
        targets: ["any-target", "player"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 3, target: 0 },
            { kind: "gain-life", amount: 3, toControllerOfTarget: 1 },
          ],
        },
      },
      {
        text: SAC_MODE,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice", who: "you", filter: {}, count: 1 },
            { kind: "draw", amount: 2 },
          ],
        },
      },
    ],
  },
});

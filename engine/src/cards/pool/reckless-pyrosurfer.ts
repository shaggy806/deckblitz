import { defineCard } from "../define.js";

// EDHREC rank 17352.
//
// "Gains battle cry until end of turn" grants the battle cry trigger (Hero
// of Bladehold's) as a `grant-triggered` on itself: each landfall grants
// another instance, and each instance triggers separately (the reminder
// text).
const BATTLE_CRY_TEXT =
  "Battle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)";
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, this creature gains battle cry until end of turn. (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn. Each instance of battle cry triggers separately.)";

export default defineCard({
  name: "Reckless Pyrosurfer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "grant-triggered",
        target: "source",
        duration: "end-of-turn",
        ability: {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "modify-pt-all",
            filter: { type: "creature", attacking: true },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
            exceptSource: true,
          },
          resolve: null,
          text: BATTLE_CRY_TEXT,
        },
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, this creature gains battle cry until end of turn.",
    },
  ],
});

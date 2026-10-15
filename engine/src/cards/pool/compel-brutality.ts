import { defineCard } from "../define.js";

// EDHREC rank 23917.
//
// The second mode is the planeswalker dealing the damage (`from`), its
// loyalty its loyalty counters (rule 306.5c), read as the spell resolves; a
// planeswalker gone by then is no longer a target, so nobody deals anything
// (the ruling).

const CREATURE_MODE =
  "Target creature you control deals damage equal to its power to target creature or planeswalker an opponent controls.";
const PLANESWALKER_MODE =
  "Target planeswalker you control deals damage equal to its loyalty to target creature or planeswalker an opponent controls.";

const VICTIM = { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } } as const;

export default defineCard({
  name: "Compel Brutality",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose one —\n• ${CREATURE_MODE}\n• ${PLANESWALKER_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: CREATURE_MODE,
        targets: ["creature-you-control", VICTIM],
        effect: { kind: "fight", a: 0, b: 1, oneSided: true },
      },
      {
        text: PLANESWALKER_MODE,
        targets: [{ kind: "permanent", whose: "you", filter: { type: "planeswalker" } }, VICTIM],
        effect: {
          kind: "damage",
          amount: { countersOn: 0, counter: "loyalty" },
          target: 1,
          from: { target: 0 },
        },
      },
    ],
  },
});

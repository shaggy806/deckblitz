import { defineCard } from "../define.js";

// Exodus (EXO). EDHREC rank 32248.
//
// "Blocked" is Tattermunge Witch's: an attacker that isn't unblocked, from the
// declare blockers step to the end of combat (before blockers are declared an
// attacker is neither, so the step gate keeps `unblocked: false` honest). A
// blocked creature stays blocked even once its blockers are gone (rule 509.1h).

const TEXT = "{R}: This creature gets +1/+0 until end of turn. Activate only if this creature is blocked.";

export default defineCard({
  name: "Cinder Crawler",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Salamander"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", steps: ["declare-blockers", "combat-damage", "end-combat"] },
          { kind: "source", filter: { attacking: true, unblocked: false } },
        ],
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});

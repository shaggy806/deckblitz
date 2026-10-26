import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 25709.
//
// "Each blocked creature" is Fight to the Death's: an attacker blocked this
// combat (rule 509.1h), from the declare blockers step to the end of combat,
// whoever controls it. Before blockers are declared nothing is blocked, so the
// step gate keeps `unblocked: false` from matching attackers not yet blocked.

const TEXT = "{R}{G}: Each blocked creature gets +1/+0 and gains trample until end of turn.";
const BLOCKED = { type: "creature", attacking: true, unblocked: false } as const;

export default defineCard({
  name: "Tattermunge Witch",
  manaCost: "{1}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "turn-structure", steps: ["declare-blockers", "combat-damage", "end-combat"] },
        then: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt-all", filter: BLOCKED, power: 1, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword-all", filter: BLOCKED, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

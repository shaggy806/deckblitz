import { defineCard } from "../define.js";

// EDHREC rank 12227. Raid's "enters with … if" is a replacement (rule
// 614.1c), its condition read as it enters (Lifecraft Cavalry's shape); the
// token is Fire Nation Attacks's 2/2 red Soldier with firebending 1.

const RAID_TEXT = "Raid — This creature enters with a +1/+1 counter on it if you attacked this turn.";
const ATTACK_TEXT = "Whenever this creature attacks, create a 2/2 red Soldier creature token with firebending 1.";

export default defineCard({
  name: "Cruel Administrator",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 5,
  toughness: 4,
  text: `${RAID_TEXT}\n${ATTACK_TEXT} (Whenever it attacks, add {R}. This mana lasts until end of combat.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
            then: 1,
            else: 0,
          },
        },
      },
      text: RAID_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token (Fire Nation Attacks)", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

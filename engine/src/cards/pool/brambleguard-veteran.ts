import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-26] Brambleguard Veteran's ability affects only Raccoons you control at the time it
//     resolves, including Brambleguard Veteran itself (as long as it's still a Raccoon at that
//     time). Raccoons you begin to control later in the turn or creatures that become Raccoons
//     later in the turn won't be affected.
//   [2024-07-26] Abilities that trigger whenever you "expend N" only trigger when you reach that
//     specific amount of mana spent on casting spells that turn. This can only happen once per turn.

const EXPEND_TEXT = "Whenever you expend 4, Raccoons you control get +1/+1 and gain vigilance until end of turn.";
// The Raccoons are fixed as it resolves (rule 611.2c, the ruling).
const RACCOONS = { subtype: "Raccoon", controlledBy: "you" } as const;

export default defineCard({
  name: "Brambleguard Veteran",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Raccoon", "Warrior"],
  power: 3,
  toughness: 4,
  text: `${EXPEND_TEXT} (You expend 4 as you spend your fourth total mana to cast spells during a turn.)`,
  triggered: [
    {
      trigger: { on: "expend", who: "you", amount: 4 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: RACCOONS, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: RACCOONS, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: EXPEND_TEXT,
    },
  ],
});

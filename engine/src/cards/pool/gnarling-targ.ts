import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const TEXT = "Whenever you attack, Klingons and Warriors you control get +2/+0 and gain trample until end of turn.";
const KLINGONS_AND_WARRIORS = { type: "creature", controlledBy: "you", subtypes: ["Klingon", "Warrior"] } as const;

export default defineCard({
  name: "Gnarling Targ",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 4,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: KLINGONS_AND_WARRIORS, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: KLINGONS_AND_WARRIORS, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

const TREASURE_TEXT = "Whenever this creature deals combat damage to a player, create that many tapped Treasure tokens.";
const TEXT = `When Grilka enters, gain control of target creature an opponent controls until end of turn. Untap it. Until end of turn, it gains trample, haste, and "${TREASURE_TEXT}"`;

export default defineCard({
  name: "Grilka, Widowed Warrior",
  manaCost: "{5}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          {
            kind: "grant-triggered",
            target: 0,
            duration: "end-of-turn",
            ability: {
              trigger: { on: "deals-combat-damage-to-player", who: "self" },
              targets: [],
              effect: { kind: "create-token", token: "Treasure Token", count: { triggerValue: true }, tapped: true },
              resolve: null,
              text: TREASURE_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

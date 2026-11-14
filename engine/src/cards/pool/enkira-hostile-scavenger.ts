import { defineCard } from "../define.js";

// "Enkira and at least two Zombies attack": two attacking Zombies besides
// Enkira, asked as the attack is declared.
const ENTERS_TEXT = "When Enkira, Hostile Scavenger enters, create two Walker tokens.";
const BLOCKED_TEXT = "As long as Enkira is equipped, it must be blocked if able.";
const ATTACK_TEXT = "Whenever Enkira and at least two Zombies attack, Enkira gains indestructible until end of turn.";

export default defineCard({
  name: "Enkira, Hostile Scavenger",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${ENTERS_TEXT} (They're 2/2 black Zombie creatures.)\n${BLOCKED_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      restrictions: ["must-be-blocked-if-able"],
      text: BLOCKED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Walker Token", count: 2 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: {
        kind: "controls",
        filter: { type: "creature", subtype: "Zombie", attacking: true },
        atLeast: 2,
        excludeSelf: true,
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

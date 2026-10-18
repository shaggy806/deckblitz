import { defineCard } from "../define.js";

// Valor's Reach Tag Team's 3/2 red and white Warrior. Sokka, Lateral
// Strategist's shape: "and at least one other creature token" is part of the
// trigger condition (rule 603.1), judged as attackers are declared. It counts
// another attacking creature token, not this one, so a nontoken creature
// that gains the ability (a copy of the token) triggers alongside a creature
// token too (the ruling); the other token needn't attack the same player.

const ATTACK_TEXT =
  "Whenever this token and at least one other creature token attack, put a +1/+1 counter on this token.";

export default defineCard({
  name: "Warrior Token (Valor's Reach Tag Team)",
  art: "a2661ea2-7ff6-4188-9d40-f18bb625ed52",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Warrior"],
  power: 3,
  toughness: 2,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: {
        kind: "controls",
        filter: { type: "creature", token: true, attacking: true },
        atLeast: 1,
        excludeSelf: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

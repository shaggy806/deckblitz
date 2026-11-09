import { defineCard } from "../define.js";

const COMBAT_TEXT =
  "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, Human Torch gains flying, double strike, and haste until end of turn.";
const WATCH_TEXT =
  "Until end of turn, whenever Human Torch deals combat damage to an opponent, he deals that much damage to each other opponent.";
const ATTACK_TEXT =
  "Whenever Human Torch attacks, you may pay {R}{G}{W}{U}. If you do, until end of turn, whenever he deals combat damage to an opponent, he deals that much damage to each other opponent.";

export default defineCard({
  name: "Human Torch",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 2,
  text: `${COMBAT_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R}{G}{W}{U}: until end of turn, Human Torch's combat damage to an opponent also hits each other opponent?",
        cost: "{R}{G}{W}{U}",
        effect: {
          kind: "delayed-trigger",
          at: {
            whenever: { on: "deals-combat-damage-to-player", who: "self", toOpponent: true },
            watching: "source",
          },
          effect: { kind: "damage", amount: { triggerValue: true }, who: "each-other-opponent" },
          text: WATCH_TEXT,
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

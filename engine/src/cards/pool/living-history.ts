import { defineCard } from "../define.js";

// EDHREC rank 25465. Secrets of Strixhaven.
//
// "If a card left your graveyard this turn" is an intervening "if" (rule
// 603.4): asked as you attack and again as the ability resolves.
const TOKEN_TEXT = "When this enchantment enters, create a 2/2 red and white Spirit creature token.";
const ATTACK_TEXT =
  "Whenever you attack, if a card left your graveyard this turn, target attacking creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Living History",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${TOKEN_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Red-White 2/2)", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      condition: { kind: "turn-stat", stat: "cards-left-graveyard", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

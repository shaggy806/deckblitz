import { defineCard } from "../define.js";

// Threshold is an intervening-if (rule 603.4): checked as the attack
// trigger would fire and again as it resolves. It returns attacking a
// player, planeswalker or battle of its controller's choice (the ruling),
// never declared as an attacker.

const PT_TEXT = "This creature gets +1/+0 for each other Rat you control.";
const RETURN_TEXT =
  "Threshold — Whenever you attack with one or more Rats, if there are seven or more cards in your graveyard, you may pay {2}{B}. If you do, return this card from your graveyard to the battlefield tapped and attacking.";

export default defineCard({
  name: "Persistent Marshstalker",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Berserker"],
  power: 3,
  toughness: 1,
  text: `${PT_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Rat", controlledBy: "you" }, pt: [1, 0], excludeSelf: true },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { type: "creature", subtype: "Rat" } },
      condition: { kind: "threshold" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B} to return Persistent Marshstalker tapped and attacking?",
        cost: "{2}{B}",
        effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true, attacking: "choose" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});

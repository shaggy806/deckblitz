import { defineCard } from "../define.js";

// EDHREC rank 19800.
//
// Noctis, Heir Apparent's Warp-Strike return: the delayed ability fires once
// attackers are declared on your next turn (never this one, so not in an
// extra combat this turn), and you choose what it attacks as it returns (rule
// 508.4) — it was never declared as an attacker, so "whenever attacks"
// doesn't trigger again. A turn with no combat lets it lapse, the card left
// in exile.

const ATTACK_TEXT =
  "Whenever this creature attacks, exile it. Return it to the battlefield under your control tapped and attacking at the beginning of the declare attackers step on your next turn.";

export default defineCard({
  name: "Meandering Towershell",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Turtle"],
  power: 5,
  toughness: 9,
  text: `Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\n${ATTACK_TEXT}`,
  keywords: ["islandwalk"],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "flicker",
        target: "source",
        underYourControl: true,
        returnAt: { step: "declare-attackers", whose: "you", which: "next-turn" },
        tapped: true,
        attacking: "choose",
        returnText: "Return it to the battlefield under your control tapped and attacking.",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

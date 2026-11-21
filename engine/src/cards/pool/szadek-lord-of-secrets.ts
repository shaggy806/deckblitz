import { defineCard } from "../define.js";

const REPLACE =
  "If Szadek would deal combat damage to a player, instead put that many +1/+1 counters on Szadek and that player mills that many cards.";

// Rulings: a replacement, not prevention, so it applies to damage that can't
// be prevented (rule 615.12) — and the player being dealt the damage chooses
// the order beside a prevention shield of theirs (616.1): preventing some
// first leaves fewer counters and cards milled (`Game.damageOrderAsked`).
// The damage is never dealt, so nothing "deals combat damage" triggers.
export default defineCard({
  name: "Szadek, Lord of Secrets",
  manaCost: "{3}{U}{U}{B}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Vampire"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${REPLACE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: true,
        fromSelf: true,
        to: "player",
        instead: {
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
              { kind: "mill", target: "trigger-player", amount: "x" },
            ],
          },
        },
      },
      text: REPLACE,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 15413.
//
// Rulings:
//   [2025-07-25] If Rust Harvester leaves the battlefield before its last ability resolves, it
//     won't have a +1/+1 counter put on it when the ability resolves. Use its power as it last
//     existed on the battlefield to determine how much damage is dealt.
//   [2025-07-25] If the target is illegal as Rust Harvester's last ability tries to resolve, it
//     won't resolve and none of its effects will happen. You won't put a +1/+1 counter on Rust
//     Harvester.
//
// Its power as the damage is dealt, after the counter — as it last existed if
// it has left (Juri's `powerOf: "source"`). Its one target illegal, the whole
// ability does nothing (rule 608.2b).

const TEXT =
  "{2}, {T}, Exile an artifact card from your graveyard: Put a +1/+1 counter on this creature, then it deals damage equal to its power to any target.";

export default defineCard({
  name: "Rust Harvester",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, exileFromGraveyard: { count: 1, filter: { type: "artifact" } } },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "damage", amount: { powerOf: "source" }, target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

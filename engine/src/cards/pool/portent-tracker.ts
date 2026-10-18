import { defineCard } from "../define.js";

// EDHREC rank 15388. March of the Machine.
//
// The untap isn't a mana ability (the ruling) — an ordinary activated one.
// "If an opponent protects it" is read from the activator's side as the
// ability resolves.

const BATTLE_TEXT =
  "{T}: Choose target battle. If an opponent protects it, remove a defense counter from it. Otherwise, put a defense counter on it. Activate only as a sorcery.";

export default defineCard({
  name: "Portent Tracker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Satyr", "Scout"],
  power: 1,
  toughness: 1,
  text: `{T}: Untap target land.\n${BATTLE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "{T}: Untap target land.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "battle" } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "battle", protectedBy: "opponent" } },
        then: { kind: "remove-counter", target: 0, counter: "defense", amount: 1 },
        else: { kind: "add-counter", target: 0, counter: "defense", amount: 1 },
      },
      resolve: null,
      text: BATTLE_TEXT,
      sorcerySpeed: true,
    },
  ],
});

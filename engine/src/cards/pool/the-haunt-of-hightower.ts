import { defineCard } from "../define.js";

// Ravnica Allegiance. "Defending player" is the attack trigger's player (the
// controller of an attacked planeswalker — the ruling). The graveyard trigger
// is per card and owner-keyed; tokens aren't cards, so they never fire it (the
// ruling).
const ATTACK_TEXT = "Whenever The Haunt of Hightower attacks, defending player discards a card.";
const GRAVEYARD_TEXT =
  "Whenever a card is put into an opponent's graveyard from anywhere, put a +1/+1 counter on The Haunt of Hightower.";

export default defineCard({
  name: "The Haunt of Hightower",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${ATTACK_TEXT}\n${GRAVEYARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "put-into-graveyard", who: "opponent" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GRAVEYARD_TEXT,
    },
  ],
});

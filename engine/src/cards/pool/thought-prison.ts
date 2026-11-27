import { defineCard } from "../define.js";

// EDHREC rank 23968.
//
// Rulings:
//   [2004-12-01] The second ability triggers only once per spell. If the spell shares both a color
//     and a mana value with the imprinted card, Thought Prison deals 2 damage, not 4.
//
// Imprint links the two abilities (rule 607.2a): the card the enters ability
// exiles is "the exiled card" to the cast trigger, for this stint of the
// artifact. One trigger a spell whichever it shares (the ruling) — one
// `anyOf`. With nothing exiled (the "may" declined, or no nonland card in
// the hand) nothing shares a color or a mana value with it, so it never
// triggers: `sharesManaValueWith` reads no reference as no match. "That
// player" is the caster.
const IMPRINT =
  "Imprint — When this artifact enters, you may have target player reveal their hand. If you do, choose a nonland card from it and exile that card.";
const PRISON =
  "Whenever a player casts a spell that shares a color or mana value with the exiled card, this artifact deals 2 damage to that player.";

export default defineCard({
  name: "Thought Prison",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `${IMPRINT}\n${PRISON}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have that player reveal their hand, and exile a nonland card from it?",
        effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
      },
      resolve: null,
      text: IMPRINT,
    },
    {
      trigger: {
        on: "cast-spell",
        who: "any",
        filter: {
          anyOf: [{ sharesColorWith: "exiled-with-source" }, { sharesManaValueWith: "exiled-with-source" }],
        },
      },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: PRISON,
    },
  ],
});

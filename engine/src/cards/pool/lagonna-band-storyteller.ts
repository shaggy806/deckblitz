import { defineCard } from "../define.js";

// EDHREC rank 23583. The card is its one target: if it has left the
// graveyard the ability doesn't resolve, so "if you do" is the "may" itself.

export default defineCard({
  name: "Lagonna-Band Storyteller",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Centaur", "Advisor"],
  power: 3,
  toughness: 4,
  text: "When this creature enters, you may put target enchantment card from your graveyard on top of your library. If you do, you gain life equal to its mana value.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "enchantment" } }],
      effect: {
        kind: "may",
        prompt: "Put the targeted enchantment card on top of your library?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "put-on-library", target: 0, position: "top" },
            { kind: "gain-life", amount: { manaValueOf: 0 } },
          ],
        },
      },
      resolve: null,
      text: "When this creature enters, you may put target enchantment card from your graveyard on top of your library. If you do, you gain life equal to its mana value.",
    },
  ],
});

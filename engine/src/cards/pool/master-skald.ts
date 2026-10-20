import { defineCard } from "../define.js";

// EDHREC rank 25434.
//
// The artifact or enchantment card is targeted as the trigger goes on the
// stack; the creature card to exile is chosen as it resolves (the ruling).
// Exiling the target itself (an artifact creature card) leaves nothing to
// return — it's no longer in the graveyard.
const TEXT =
  "When this creature enters, you may exile a creature card from your graveyard. If you do, return target artifact or enchantment card from your graveyard to your hand.";

export default defineCard({
  name: "Master Skald",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
      effect: {
        kind: "may",
        prompt: "Exile a creature card from your graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 1,
              max: 1,
              filter: { type: "creature" },
              destination: "exile",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: { kind: "return-to-hand", target: 0, from: "graveyard" },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

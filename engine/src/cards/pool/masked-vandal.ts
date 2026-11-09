import { defineCard } from "../define.js";

// EDHREC rank 2177. The target is chosen as the trigger goes on the stack; the
// creature card to exile as it resolves (the ruling).
const TEXT = "When this creature enters, you may exile a creature card from your graveyard. If you do, exile target artifact or enchantment an opponent controls.";

export default defineCard({
  name: "Masked Vandal",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 3,
  keywords: ["changeling"],
  text: `Changeling (This card is every creature type.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "enchantment"] } },
      ],
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
              then: { kind: "exile", target: 0 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

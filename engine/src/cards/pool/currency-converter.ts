import { defineCard } from "../define.js";

export default defineCard({
  name: "Currency Converter",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text:
    "Whenever you discard a card, you may exile that card from your graveyard.\n{2}, {T}: Draw a card, then discard a card.\n{T}: Put a card exiled with this artifact into its owner's graveyard. If it's a land card, create a Treasure token. If it's a nonland card, create a 2/2 black Rogue creature token.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "{2}, {T}: Draw a card, then discard a card.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      // A card exiled with this artifact (rule 607.2a), chosen as it
      // resolves; then the token by what that card is.
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        destination: "graveyard",
        leftover: "stay",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { type: "land" } },
              then: { kind: "create-token", token: "Treasure Token", count: 1 },
            },
            {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { notTypes: ["land"] } },
              then: { kind: "create-token", token: "Rogue Token", count: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: "{T}: Put a card exiled with this artifact into its owner's graveyard. If it's a land card, create a Treasure token. If it's a nonland card, create a 2/2 black Rogue creature token.",
    },
  ],
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile that card from your graveyard with Currency Converter?",
        effect: { kind: "exile", target: "trigger-object", linked: true },
      },
      resolve: null,
      text: "Whenever you discard a card, you may exile that card from your graveyard.",
    },
  ],
});

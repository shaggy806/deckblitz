import { defineCard } from "../define.js";

export default defineCard({
  name: "Intellect Devourer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 2,
  toughness: 4,
  text: "Devour Intellect — When this creature enters, each opponent exiles a card from their hand until this creature leaves the battlefield.\nBody Thief — You may play lands and cast spells from among cards exiled with this creature. If you cast a spell this way, you may spend mana as though it were mana of any color to cast it.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: "Devour Intellect — When this creature enters, each opponent exiles a card from their hand until this creature leaves the battlefield.",
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "discard-chosen",
          target: "that-player",
          chooser: "that-player",
          lookOnly: true,
          destination: "exile",
          untilSourceLeaves: true,
        },
      },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      text: "Body Thief — You may play lands and cast spells from among cards exiled with this creature. If you cast a spell this way, you may spend mana as though it were mana of any color to cast it.",
      playFromExile: { filter: {}, linked: true, spendAs: "any-color" },
    },
  ],
});

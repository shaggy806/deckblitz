import { defineCard } from "../define.js";

const HIT =
  "Whenever this creature deals combat damage to a player, sacrifice all other permanents you control and discard your hand. Exile the top six cards of your library. You may cast any number of spells from among cards exiled this way without paying their mana costs.";

export default defineCard({
  name: "Hellcarver Demon",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${HIT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-permanent",
            filter: { controlledBy: "you" },
            exceptSource: true,
            simultaneous: true,
            effect: { kind: "sacrifice-target", target: 0 },
          },
          { kind: "discard-hand", who: "you" },
          { kind: "exile-from-library", amount: 6 },
          { kind: "cast-now", from: "exiled-this-way", repeat: true, free: true },
        ],
      },
      resolve: null,
      text: HIT,
    },
  ],
});

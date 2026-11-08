import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, that player exiles a card from their hand. You may play that card for as long as it remains exiled.";
const REGENERATE_TEXT = "Sacrifice a Human: Regenerate this creature.";

export default defineCard({
  name: "Fiend of the Shadows",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT}\n${REGENERATE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        player: "that-player",
        zone: "hand",
        min: 1,
        max: 1,
        destination: "exile",
        unlinked: true,
        leftover: "stay",
        mayPlay: { duration: "while-exiled", play: true },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Human" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGENERATE_TEXT,
    },
  ],
});

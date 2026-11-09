import { defineCard } from "../define.js";

// "A permanent" is a source on the battlefield: a spell, or a card dealing
// damage from a hand or graveyard, isn't one. A source that left in the meantime
// can't be returned from the zone it went to, so nothing is lost there.
const TEXT = "Whenever a permanent deals damage to you, return it to its owner's hand.";

export default defineCard({
  name: "Dissipation Field",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", to: "you", filter: { inZone: "battlefield" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});

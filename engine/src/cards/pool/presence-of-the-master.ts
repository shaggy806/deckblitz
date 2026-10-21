import { defineCard } from "../define.js";

// Legends. EDHREC rank 26361.
//
// Rulings:
//   This effect triggers when the spell is announced and prior to allowing responses to it.
//   Does not stop enchantments from being put onto the battlefield by a spell or ability.
const TEXT = "Whenever a player casts an enchantment spell, counter it.";

export default defineCard({
  name: "Presence of the Master",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "counter", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});

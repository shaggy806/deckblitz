import { defineCard } from "../define.js";

// EDHREC rank 20949. Future Sight.
//
// Poisonous 3 granted as the triggered ability it is (Virulent Sliver's
// shape, rule 702.70a).

const GRANT_TEXT =
  "Enchanted creature has poisonous 3. (Whenever it deals combat damage to a player, that player gets three poison counters. A player with ten or more poison counters loses the game.)";

export default defineCard({
  name: "Snake Cult Initiation",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "add-player-counters", counter: "poison", amount: 3, who: "trigger-player" },
          resolve: null,
          text: "Poisonous 3 (Whenever this creature deals combat damage to a player, that player gets three poison counters.)",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});

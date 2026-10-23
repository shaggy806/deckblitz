import { defineCard } from "../define.js";

// EDHREC rank 4043. "That many" is the excess dealt to the target slot's
// permanent this way (rule 120.4a): past lethal for a creature (damage already
// marked counts), past loyalty for a planeswalker, past defense for a battle.
// A player has no excess, so 5 to a player makes no Treasure. Improvise
// (rule 702.126a) pays generic mana only, never the {R}.
export default defineCard({
  name: "Bottle-Cap Blast",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  improvise: true,
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nBottle-Cap Blast deals 5 damage to any target. If excess damage was dealt to a permanent this way, create that many tapped Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      {
        kind: "create-token",
        token: "Treasure Token",
        count: { excessDamageThisWay: true, to: 0 },
        tapped: true,
      },
    ],
  },
});

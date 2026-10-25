import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 13044.

const PROWESS: TriggeredAbility = {
  trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
  targets: [],
  effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
  resolve: null,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
};

export default defineCard({
  name: "Triton Wavebreaker",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: "Bestow {1}{U} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nAs long as this permanent is a creature, it has prowess. (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nEnchanted creature gets +1/+1 and has prowess.",
  bestow: "{1}{U}",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { type: "creature" } },
      grantsTriggered: [PROWESS],
      text: "As long as this permanent is a creature, it has prowess.",
    },
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [PROWESS],
      text: "Enchanted creature gets +1/+1 and has prowess.",
    },
  ],
});

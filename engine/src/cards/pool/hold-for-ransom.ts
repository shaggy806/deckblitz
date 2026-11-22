import { defineCard } from "../define.js";

// The granted ability is activated by the enchanted creature's controller
// (the ruling); "it" is Hold for Ransom, the granter (rule 201.5a), which its
// own controller sacrifices (701.21a) before drawing — the draw read off the
// Aura as it last existed if it's gone by then (608.2h).

const GRANTED = "{7}: Hold for Ransom's controller sacrifices it and draws a card. Activate only as a sorcery.";
const TEXT = `Enchanted creature can't attack or block and has "${GRANTED}"`;

export default defineCard({
  name: "Hold for Ransom",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      grantsActivated: [
        {
          cost: { mana: "{7}", tap: false },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "sacrifice-target", target: "granter", byItsController: true },
              { kind: "draw", amount: 1, who: { controllerOf: "granter" } },
            ],
          },
          sorcerySpeed: true,
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});

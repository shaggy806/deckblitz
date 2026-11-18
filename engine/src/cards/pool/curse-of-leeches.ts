import { defineCard } from "../define.js";

// EDHREC rank 14325. A daybound Curse; the back face is Leeching Lurker.
//
// Rulings this follows: cast at night, it still targets a player but enters
// transformed, attached to no one. Transformed into
// Leeching Lurker it becomes unattached from its player as a state-based
// action (704.5p). As it transforms back into Curse of Leeches (it becomes
// day — daybound/nightbound are the only way it transforms), its controller
// chooses a player and it's attached to them (rule 712.20): not targeting, so
// a hexproof player can be chosen; only a player it could enchant is offered.
// `choosePlayerOnTransform` is the choice — asked as the day/night change
// happens, in the untap step if that's where — and `asTransformsInto`
// attaches it to the one chosen.
const ATTACH = "As this permanent transforms into Curse of Leeches, attach it to a player.";
const UPKEEP = "At the beginning of enchanted player's upkeep, they lose 1 life and you gain 1 life.";

export default defineCard({
  name: "Curse of Leeches",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  targets: ["player"],
  keywords: ["daybound"],
  text:
    `Enchant player\n${ATTACH}\n${UPKEEP}\n` +
    "Daybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  choosePlayerOnTransform: "player",
  asTransformsInto: { kind: "attach", target: { player: "chosen-player" } },
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "active-player" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  faces: ["Curse of Leeches", "Leeching Lurker"],
  transform: true,
});

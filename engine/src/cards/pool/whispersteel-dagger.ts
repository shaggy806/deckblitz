import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "Whenever equipped creature deals combat damage to a player, you may cast a creature spell from that player's graveyard this turn, and you may spend mana as though it were mana of any color to cast that spell.";

// The trigger chooses nothing: it gives a permission to cast one creature
// spell from the damaged player's graveyard later this turn (its ruling), by
// the normal timing and costs, alternative costs included. A resolved
// `player-effect` over that graveyard (`whose: "trigger-player"`), for one
// spell (`once`), whose mana may be spent as any color (rule 609.4b). The
// caster controls the spell and the permanent it becomes; its owner still
// owns it (rule 108.3), and it's exiled if its controller leaves the game
// (rule 800.4a).
export default defineCard({
  name: "Whispersteel Dagger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +2/+0.\n${DAMAGE_TEXT}\nEquip {3}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        mayPlay: { from: "graveyard", filter: { type: "creature" }, whose: "trigger-player", upTo: 1, spendAs: "any-color" },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});

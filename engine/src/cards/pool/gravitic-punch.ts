import { defineCard } from "../define.js";

// EDHREC rank 9821.
//
// The creature is the damage's source (`from`), not the spell, so its
// lifelink and deathtouch apply; an illegal creature target leaves its slot
// blank and no damage is dealt (rule 608.2b — the ruling). Jump-start is the
// discard-a-card flashback (Radical Idea).

export default defineCard({
  name: "Gravitic Punch",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{3}{R}", discard: 1, keyword: "jump-start" },
  text: "Target creature you control deals damage equal to its power to target player.\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
  targets: ["creature-you-control", "player"],
  effect: { kind: "damage", amount: { powerOf: 0 }, target: 1, from: { target: 0 } },
});

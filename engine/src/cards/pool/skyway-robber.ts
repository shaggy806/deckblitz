import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// "Escapes with [ability]" is "if this permanent escaped, it has [ability]" (rule
// 702.138d): a static on `castVia`. "Cards exiled with this creature" are those its
// own escape exiled the last time it escaped, and no others (the ruling):
// `escape.exileLinked`.
const COMBAT_TEXT =
  "Whenever this creature deals combat damage to a player, you may cast an artifact, instant, or sorcery spell from among cards exiled with this creature without paying its mana cost.";
const ESCAPES_TEXT = `This creature escapes with "${COMBAT_TEXT}"`;

const ON_COMBAT_DAMAGE: TriggeredAbility = {
  trigger: { on: "deals-combat-damage-to-player", who: "self" },
  targets: [],
  effect: {
    kind: "cast-now",
    from: "exiled-with-source",
    spell: { typesAnyOf: ["artifact", "instant", "sorcery"] },
    free: true,
  },
  resolve: null,
  text: COMBAT_TEXT,
};

export default defineCard({
  name: "Skyway Robber",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\nEscape—{3}{U}, Exile five other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)\n${ESCAPES_TEXT}`,
  escape: { cost: "{3}{U}", exileCount: 5, exileLinked: true },
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { castVia: "escape" } },
      grantsTriggered: [ON_COMBAT_DAMAGE],
      text: ESCAPES_TEXT,
    },
  ],
});

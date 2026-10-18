import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 14034.
// Rulings: X is the mana actually spent — 6 for its mana cost, 10 with
// flashback, plus any additional costs (`manaSpentOf`); you can't spend more
// to grow it. The first token is created before the rest; then one more for
// each opponent with three or more poison counters, those entering at the
// same time (`for-each-player`, `simultaneous`).

const WURM: EffectSpec = {
  kind: "create-token",
  token: "Phyrexian Wurm Token",
  count: 1,
  basePt: { power: { manaSpentOf: "source" }, toughness: { manaSpentOf: "source" } },
};

export default defineCard({
  name: "Wurmquake",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{8}{G}{G}" },
  text: "Corrupted — Create an X/X green Phyrexian Wurm creature token with trample and toxic 1, where X is the amount of mana spent to cast this spell. Then for each opponent with three or more poison counters, you create another one of those tokens.\nFlashback {8}{G}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      WURM,
      {
        kind: "for-each-player",
        who: "each-opponent",
        simultaneous: true,
        effect: {
          kind: "conditional",
          condition: { kind: "player-counters", counter: "poison", who: "that-player", atLeast: 3 },
          then: WURM,
        },
      },
    ],
  },
});

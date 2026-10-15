import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 17663.
//
// Rulings:
//   [2025-02-07] You may activate this creature's exhaust ability without discarding cards if
//     you just want to put a +1/+1 counter on it.
//
// "Discard up to two cards" is chosen as the ability resolves: how many (none,
// one or two — a resolution-time `modal`, Delivery Moogle's shape for a choice
// that isn't a mode), then which; "that many" is the cards actually discarded
// (`thisWay: "discarded"`), so asking for two with one card in hand draws one.
// The counter goes on either way.

const TEXT =
  "Exhaust — {2}{R}: Discard up to two cards, then draw that many cards. Put a +1/+1 counter on this creature.";

const discardThenDraw = (n: number): EffectSpec => ({
  kind: "sequence",
  effects: [
    { kind: "discard", target: "you", amount: n },
    { kind: "draw", amount: { thisWay: "discarded" } },
  ],
});

export default defineCard({
  name: "Greasewrench Goblin",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 2,
  toughness: 1,
  text: `${TEXT} (Activate each exhaust ability only once.)`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              { text: "Discard no cards", effect: { kind: "sequence", effects: [] } },
              { text: "Discard one card, then draw a card", effect: discardThenDraw(1) },
              { text: "Discard two cards, then draw that many cards", effect: discardThenDraw(2) },
            ],
          },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
      exhaust: true,
    },
  ],
});

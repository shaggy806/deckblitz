import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Phyrexia: All Will Be One (ONE). EDHREC rank 5976.
//
// Rulings:
//   [2023-02-04] If X is 5 or more, you choose whether to put both cards into your hand or both
//     cards onto the battlefield. You can't choose to put one into your hand and the other onto
//     the battlefield.
//
// "A creature card and/or a land card" is one card a slot (`oneEach`): a land creature fills
// either. At X 5 or more the chosen cards wait where they are while the rest go to the bottom,
// then one choice sends them all the same way, at the same time.

const reveal = (destination: "hand" | "stay", then?: EffectSpec): EffectSpec => ({
  kind: "look-and-choose",
  zone: "library",
  count: { sum: ["x", 1] },
  reveal: true,
  min: 0,
  max: 2,
  together: {
    oneEach: [
      { label: "a creature card", filter: { type: "creature" } },
      { label: "a land card", filter: { type: "land" } },
    ],
    text: "a creature card and/or a land card",
  },
  destination,
  leftover: "bottom-random",
  ...(then !== undefined ? { then } : {}),
});

const each = (effect: EffectSpec): EffectSpec => ({ kind: "for-each-target", from: 0, simultaneous: true, effect });

export default defineCard({
  name: "Green Sun's Twilight",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Reveal the top X plus one cards of your library. Choose a creature card and/or a land card " +
    "from among them. Put those cards into your hand and the rest on the bottom of your library " +
    "in a random order. If X is 5 or more, instead put the chosen cards onto the battlefield or " +
    "into your hand and the rest on the bottom of your library in a random order.",
  effect: {
    kind: "conditional",
    condition: { kind: "x", compare: { op: "gte", n: 5 } },
    then: reveal("stay", {
      kind: "modal",
      minModes: 1,
      maxModes: 1,
      modes: [
        { text: "Put the chosen cards onto the battlefield", effect: each({ kind: "put-onto-battlefield", target: 0 }) },
        { text: "Put the chosen cards into your hand", effect: each({ kind: "return-to-hand", target: 0, from: "library" }) },
      ],
    }),
    else: reveal("hand"),
  },
});

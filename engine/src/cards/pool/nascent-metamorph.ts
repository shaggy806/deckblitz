import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Commander 2020. One ability with two trigger events (attacks, blocks). The
// card found is copied while it's still revealed, then every revealed card —
// it included — goes to the bottom in a random order (its ruling). With no
// creature card in that library, nothing is copied and every card is "the rest".

const TEXT =
  "Whenever this creature attacks or blocks, target opponent reveals cards from the top of their library until they reveal a creature card. This creature becomes a copy of that card until end of turn. Then that player puts all cards revealed this way on the bottom of their library in a random order.";

const EFFECT: EffectSpec = {
  kind: "reveal-until",
  whose: 0,
  filter: { type: "creature" },
  then: { kind: "become-copy", target: "source", of: 0, until: "end-of-turn" },
  rest: "bottom-random",
};

export default defineCard({
  name: "Nascent Metamorph",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["opponent"],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "self" },
      sameAbilityAs: 0,
      targets: ["opponent"],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});

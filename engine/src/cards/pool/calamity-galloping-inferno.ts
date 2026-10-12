import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle } from "../helpers.js";
import type { EffectSpec } from "../../effects.js";

// The creature is chosen as it resolves — not targeted — from the
// nonlegendary creatures that saddled Calamity this turn (rule 702.171c) and
// are still the same objects; the same one may be chosen both times (the
// rulings). Each token copies the original's copiable values (707.2), enters
// tapped and attacking whatever its controller picks for it (508.4 — never
// declared, so no attack trigger sees it) and is sacrificed at the next end
// step.
const ATTACK_TEXT =
  "Whenever Calamity attacks while saddled, choose a nonlegendary creature that saddled it this turn and create a tapped and attacking token that's a copy of it. Sacrifice that token at the beginning of the next end step. Repeat this process once.";

const COPY_ONE: EffectSpec = {
  kind: "choose-permanents",
  filter: { type: "creature", notSupertype: "legendary", saddledSource: true },
  upTo: 1,
  min: 1,
  then: {
    kind: "create-token-copy",
    of: 0,
    count: 1,
    who: "you",
    tapped: true,
    attacking: "choose",
    sacrificeAtEndStep: true,
  },
  prompt: "Choose a nonlegendary creature that saddled Calamity this turn to copy",
};

export default defineCard({
  name: "Calamity, Galloping Inferno",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Horse", "Mount"],
  power: 4,
  toughness: 6,
  keywords: ["haste"],
  text: `Haste\n${ATTACK_TEXT}\nSaddle 1`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: { kind: "sequence", effects: [COPY_ONE, COPY_ONE] },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(1)],
});

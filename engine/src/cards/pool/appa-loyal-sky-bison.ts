import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 6193.
//
// Rulings: airbend's — its owner may cast the card from exile for {2} (an
// alternative cost: X is 0, additional costs still paid), a token exiled is
// gone, a land can't be played from there.
//
// "Enters or attacks" is two triggers with one modal effect, its mode chosen
// as it's put on the stack (rule 700.2b — Sauron, Dino Devotee's shape).
const TRIGGER_TEXT = "Whenever Appa enters or attacks, choose one —";
const FLYING_MODE = "Target creature you control gains flying until end of turn.";
const AIRBEND_MODE = "Airbend another target nonland permanent you control.";

const MODES: EffectSpec = {
  kind: "modal",
  announced: true,
  minModes: 1,
  maxModes: 1,
  modes: [
    {
      text: FLYING_MODE,
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
    },
    {
      text: AIRBEND_MODE,
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } } }],
      effect: { kind: "exile", target: 0, airbend: true },
    },
  ],
};

const TEXT = `${TRIGGER_TEXT} ${FLYING_MODE} ${AIRBEND_MODE}`;

export default defineCard({
  name: "Appa, Loyal Sky Bison",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bison", "Ally"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text:
    `Flying\n${TRIGGER_TEXT}\n• ${FLYING_MODE}\n• ${AIRBEND_MODE} ` +
    "(Exile it. While it's exiled, its owner may cast it for {2} rather than its mana cost.)",
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: MODES, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: MODES, resolve: null, text: TEXT },
  ],
});

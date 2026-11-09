import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 10968. Auras that can't enchant Bruna aren't attached and stay
// where they are (the ruling, rule 303.4i).
const TEXT =
  "Whenever Bruna attacks or blocks, you may attach to it any number of Auras on the battlefield and you may put onto the battlefield attached to it any number of Aura cards that could enchant it from your graveyard and/or hand.";

const EFFECT: EffectSpec = {
  kind: "sequence",
  effects: [
    {
      kind: "attach",
      target: "source",
      attachment: { choose: { subtype: "Aura" }, prompt: "Attach any number of Auras on the battlefield to Bruna" },
    },
    {
      kind: "return-from-graveyard",
      filter: { subtype: "Aura" },
      destination: "battlefield",
      count: 99,
      upTo: true,
      from: "hand-or-graveyard",
      attachedTo: "source",
    },
  ],
};

export default defineCard({
  name: "Bruna, Light of Alabaster",
  manaCost: "{3}{W}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
  ],
});

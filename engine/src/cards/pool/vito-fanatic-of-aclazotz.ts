import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 9142.
//
// Rulings:
//   [2023-11-10] Vito's triggered ability has no effect each time beyond the third it resolves in
//     a turn.
//   [2023-11-10] If you sacrifice Vito at the same time you sacrifice other permanents, Vito's
//     ability will trigger for each of those other permanents.
//
// Bloodbriar's "whenever you sacrifice another permanent" — once per
// permanent — with Victor, Valgavoth's Seneschal's count of this ability's
// resolutions this turn; a fourth and later resolution does nothing.
const TEXT =
  "Whenever you sacrifice another permanent, you gain 2 life if this is the first time this ability has resolved this turn. If it's the second time, each opponent loses 2 life. If it's the third time, create a 4/3 white and black Vampire Demon creature token with flying.";
const EFFECT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "conditional", condition: { kind: "resolved-this-turn", n: 1 }, then: { kind: "gain-life", amount: 2 } },
    {
      kind: "conditional",
      condition: { kind: "resolved-this-turn", n: 2 },
      then: { kind: "lose-life", amount: 2, who: "each-opponent" },
    },
    {
      kind: "conditional",
      condition: { kind: "resolved-this-turn", n: 3 },
      then: { kind: "create-token", token: "Vampire Demon Token", count: 1 },
    },
  ],
};

export default defineCard({
  name: "Vito, Fanatic of Aclazotz",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Demon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    { trigger: { on: "sacrifice", who: "you", otherOnly: true }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
  ],
});

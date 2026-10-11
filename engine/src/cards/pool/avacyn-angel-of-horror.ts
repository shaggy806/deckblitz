import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Reality Fracture Commander (FRC). EDHREC rank 7634.
//
// Rulings:
//   [2026-08-21] If Avacyn dies at the same time as another nontoken creature, her ability will
//     trigger for each of them.
//
// "Avacyn" counts even as a token copy; the others must be nontoken — two
// triggers for the two halves (Pawn of Ulamog's shape), each with Marchesa,
// the Black Rose's delayed return of "that card", which finds it only while
// it's still the card that died (rule 400.7).

const TEXT =
  "Whenever Avacyn or another nontoken creature you control dies, return that card to the battlefield under your control at the beginning of the next end step.";

const RETURN: EffectSpec = {
  kind: "delayed-trigger",
  at: "next-end-step",
  effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
  text: "Return that card to the battlefield under your control.",
};

export default defineCard({
  name: "Avacyn, Angel of Horror",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 8,
  toughness: 8,
  keywords: ["flying", "deathtouch"],
  text: `Flying, deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: RETURN,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", token: false }, otherOnly: true },
      targets: [],
      effect: RETURN,
      resolve: null,
      text: TEXT,
    },
  ],
});

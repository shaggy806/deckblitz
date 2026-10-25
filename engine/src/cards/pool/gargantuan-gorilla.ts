import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Alliances. EDHREC rank 28021.
//
// Rulings:
//   [2004-10-04] If this leaves the battlefield before its activated ability resolves, it will
//     still deal damage to the targeted creature. On the other hand, if the targeted creature
//     leaves the battlefield before the ability resolves, the ability won't resolve and no damage
//     will be dealt.
//   [2004-10-04] Giving either creature first strike does not affect the ability.
//
// The upkeep: a `may` whose "yes" sacrifices a Forest (the player picks
// which, snow or not) — and if none was sacrificed, the "you don't" applies
// as surely as declining does. The trample reads the sacrificed Forest
// (`this-way` `sacrificed`, snow).
//
// The activated ability isn't a fight (no "fights" trigger, rule 701.14):
// its own damage reads the Gorilla's power as it last existed, so it deals
// it even if it has left (the ruling), then the target deals its power back
// (a one-sided `fight`, which emits no fight event).

const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may sacrifice a Forest. If you sacrifice a snow Forest this way, this creature gains trample until end of turn. If you don't sacrifice a Forest, sacrifice this creature and it deals 7 damage to you.";
const TAP_TEXT =
  "{T}: This creature deals damage equal to its power to another target creature. That creature deals damage equal to its power to this creature.";

const PENALTY: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "sacrifice-source" },
    { kind: "damage", amount: 7, who: "you" },
  ],
};

export default defineCard({
  name: "Gargantuan Gorilla",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape"],
  power: 7,
  toughness: 7,
  text: `${UPKEEP_TEXT}\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          { kind: "fight", a: 0, b: "source", oneSided: true },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice a Forest? If you don't, sacrifice Gargantuan Gorilla and it deals 7 damage to you.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice", who: "you", filter: { subtype: "Forest" }, count: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
              then: {
                kind: "conditional",
                condition: { kind: "this-way", what: "sacrificed", filter: { supertype: "snow" }, atLeast: 1 },
                then: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
              },
              else: PENALTY,
            },
          ],
        },
        else: PENALTY,
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});

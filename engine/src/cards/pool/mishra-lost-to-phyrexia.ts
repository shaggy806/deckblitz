import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// The combined back face of Phyrexian Dragon Engine and Mishra, Claimed by
// Gix (rule 712.5): never a card of its own, only the face of the permanent
// they meld into (`meldOf`). Its mana value there is theirs summed, 7 (rule
// 712.8g); black and red by its color indicator.
//
// "Choose three": three different modes of the six, chosen as the ability is
// put on the stack with their targets (rule 700.2b). Melded by Mishra,
// Claimed by Gix it enters tapped and attacking, so "enters" triggers and
// "attacks" doesn't (rule 508.4).
//
// Rulings:
//   [2022-10-14] Note that the permanent represented by the combined back faces has a color
//     indicator.
//   [2022-10-14] While a melded permanent is on the battlefield, it has only the characteristics
//     of its combined back face. Any effects that modify how the new object enters the
//     battlefield will consider only the combined back face.
const TRIGGER_TEXT = "Whenever Mishra enters or attacks, choose three —";
const DISCARD = "Target opponent discards two cards.";
const DAMAGE = "Mishra deals 3 damage to any target.";
const DESTROY = "Destroy target artifact or planeswalker.";
const EVASION = "Creatures you control gain menace and trample until end of turn.";
const SHRINK = "Creatures you don't control get -1/-1 until end of turn.";
const POWERSTONES = "Create two tapped Powerstone tokens.";

const MODAL: EffectSpec = {
  kind: "modal",
  announced: true,
  minModes: 3,
  maxModes: 3,
  modes: [
    { text: DISCARD, targets: ["opponent"], effect: { kind: "discard", target: 0, amount: 2 } },
    { text: DAMAGE, targets: ["any-target"], effect: { kind: "damage", amount: 3, target: 0 } },
    {
      text: DESTROY,
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "planeswalker"] } }],
      effect: { kind: "destroy", target: 0 },
    },
    {
      text: EVASION,
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "menace", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "trample", duration: "end-of-turn" },
        ],
      },
    },
    {
      text: SHRINK,
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
    },
    { text: POWERSTONES, effect: { kind: "create-token", token: "Powerstone Token", count: 2, tapped: true } },
  ],
};

export default defineCard({
  name: "Mishra, Lost to Phyrexia",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Artificer"],
  power: 9,
  toughness: 9,
  meldOf: ["Phyrexian Dragon Engine", "Mishra, Claimed by Gix"],
  text: `${TRIGGER_TEXT}\n• ${DISCARD}\n• ${DAMAGE}\n• ${DESTROY}\n• ${EVASION}\n• ${SHRINK}\n• ${POWERSTONES}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: MODAL, resolve: null, text: TRIGGER_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: MODAL, resolve: null, text: TRIGGER_TEXT },
  ],
});

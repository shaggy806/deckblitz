import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 12042. Ixalan. "Enters or attacks" is two triggers with one
// effect (Raven Eagle). The target is required as the trigger goes on the
// stack; whether to exile it is chosen as it resolves. What was exiled this
// way decides the bonus: an artifact creature card is a creature card, so
// never both (the ruling).
const TEXT =
  "Whenever this creature enters or attacks, you may exile target card from a graveyard. If a creature card is exiled this way, you gain 2 life. If a noncreature card is exiled this way, this creature gets +1/+1 until end of turn.";

const EXILE: EffectSpec = {
  kind: "may",
  prompt: "Exile target card from a graveyard?",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
        then: { kind: "gain-life", amount: 2 },
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "exiled", filter: { notTypes: ["creature"] } },
        then: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      },
    ],
  },
};

const GRAVEYARD_CARD = [{ kind: "card-in-graveyard", whose: "any" }] as const;

export default defineCard({
  name: "Deathgorge Scavenger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: GRAVEYARD_CARD,
      effect: EXILE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: GRAVEYARD_CARD,
      effect: EXILE,
      resolve: null,
      text: TEXT,
    },
  ],
});

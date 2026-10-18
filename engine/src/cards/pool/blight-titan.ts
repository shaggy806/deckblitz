import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 11233.
//
// X is counted after the mill, as the incubate happens ("mill two cards,
// then incubate X"), so the two milled cards count.

const TEXT =
  "Whenever this creature enters or attacks, mill two cards, then incubate X, where X is the number of creature cards in your graveyard.";

const EFFECT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "mill", target: "you", amount: 2 },
    { kind: "incubate", amount: { countInGraveyard: { type: "creature", ownedBy: "you" } } },
  ],
};

export default defineCard({
  name: "Blight Titan",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Giant"],
  power: 6,
  toughness: 6,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT} (Create an Incubator token with X +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});

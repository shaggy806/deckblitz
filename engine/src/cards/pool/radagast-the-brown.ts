import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Rulings:
//   If the top X cards of your library don't contain a creature card that doesn't share a
//     creature type with a creature you control, you won't get to put a card into your hand.
//   If a token copy of Radagast the Brown enters the battlefield, its own ability will trigger.

const TEXT =
  "Whenever Radagast or another nontoken creature you control enters, look at the top X cards of your library, where X is that creature's mana value. You may reveal a creature card that doesn't share a creature type with a creature you control from among those cards and put it into your hand. Put the rest on the bottom of your library in a random order.";

const LOOK: EffectSpec = {
  kind: "look-and-choose",
  zone: "library",
  count: { manaValueOf: "trigger-object" },
  reveal: "chosen",
  min: 0,
  max: 1,
  filter: { type: "creature", not: { sharesCreatureTypeWith: { controlled: { type: "creature" } } } },
  destination: "hand",
  leftover: "bottom-random",
};

export default defineCard({
  name: "Radagast the Brown",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 2,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      // Radagast itself, token or not (the ruling).
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: LOOK,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", token: false }, otherOnly: true },
      sameAbilityAs: 0,
      targets: [],
      effect: LOOK,
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// "Jedit Ojanen or another legendary creature you control" — Frodo Baggins's
// shape: one trigger for itself, one for the others, the same ability.
const TEXT =
  "Whenever Jedit Ojanen or another legendary creature you control enters, you may pay {G}. If you do, create a 2/2 green Cat Warrior creature token with forestwalk. (It can't be blocked as long as defending player controls a Forest.)";
const CAT = {
  kind: "may",
  prompt: "Pay {G} to create a 2/2 Cat Warrior with forestwalk?",
  cost: "{G}",
  effect: { kind: "create-token", token: "Cat Warrior Token", count: 1 },
} as const;

export default defineCard({
  name: "Jedit Ojanen, Mercenary",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Mercenary"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: CAT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", supertype: "legendary" },
        otherOnly: true,
      },
      sameAbilityAs: 0,
      targets: [],
      effect: CAT,
      resolve: null,
      text: TEXT,
    },
  ],
});

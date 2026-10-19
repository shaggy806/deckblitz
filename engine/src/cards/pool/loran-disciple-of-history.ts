import { defineCard } from "../define.js";

// EDHREC rank 13991.
//
// Frodo Baggins's "~ or another legendary creature you control enters": Loran itself triggers it
// whether or not it's legendary (a nonlegendary copy of it still does), so it's a self trigger
// and an other-legendary trigger sharing one ability.

const TEXT =
  "Whenever Loran or another legendary creature you control enters, return target artifact card from your graveyard to your hand.";
const TARGETS = [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }] as const;
const EFFECT = { kind: "return-to-hand", target: 0, from: "graveyard" } as const;

export default defineCard({
  name: "Loran, Disciple of History",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [...TARGETS],
      effect: EFFECT,
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
      targets: [...TARGETS],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});

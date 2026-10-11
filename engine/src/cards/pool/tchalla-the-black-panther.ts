import { defineCard } from "../define.js";

// EDHREC rank 15230. Marvel Super Heroes Commander.
//
// "Enters or attacks" is two triggers with one effect (Vibranium Mining
// Mech). The cast trigger reads the artifact spell's mana value on the stack.
const MAKE_TEXT =
  "Whenever T'Challa enters or attacks, create a tapped Vibranium token. (It's an artifact with indestructible and \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")";
const GROW_TEXT =
  "Whenever you cast an artifact spell with mana value 4 or greater, put two +1/+1 counters on T'Challa.";
const make = { kind: "create-token", token: "Vibranium Token", count: 1, tapped: true } as const;

export default defineCard({
  name: "T'Challa, the Black Panther",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Hero"],
  power: 2,
  toughness: 2,
  text: `${MAKE_TEXT}\n${GROW_TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: make, resolve: null, text: MAKE_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: make, resolve: null, text: MAKE_TEXT },
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { type: "artifact", manaValue: { op: "gte", n: 4 } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});

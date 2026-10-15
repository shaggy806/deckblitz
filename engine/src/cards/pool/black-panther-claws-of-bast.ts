import { defineCard } from "../define.js";

// EDHREC rank 21425.
// Spider-Man Noir's "attacks alone" trigger, without the surveil.

const ALONE_TEXT = "Whenever a creature you control attacks alone, put a +1/+1 counter on it.";

export default defineCard({
  name: "Black Panther, Claws of Bast",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink (Damage dealt by this creature also causes you to gain that much life.)\n${ALONE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ALONE_TEXT,
    },
  ],
});

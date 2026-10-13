import { defineCard } from "../define.js";

// EDHREC rank 10424.

const DIES_TEXT =
  "When Ozox dies, create Jumblebones, a legendary 2/1 black Skeleton creature token with \"Jumblebones can't block\" and \"When Jumblebones leaves the battlefield, return target card named Ozox, the Clattering King from your graveyard to your hand.\"";

// Jumblebones is its own token file (tokens/jumblebones.ts), a named
// legendary token like Mabel's Cragflame.
export default defineCard({
  name: "Ozox, the Clattering King",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Skeleton", "Noble"],
  power: 3,
  toughness: 2,
  text: `Ozox can't block.\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Jumblebones", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "Ozox can't block." }],
});

import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 32672.

export default defineCard({
  name: "Daniels, Temporal Agent",
  manaCost: "{2}{B/G}{B/G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 1,
  text: "When Daniels enters, return target creature card from your graveyard to your hand.\n{2}, Put this card from your graveyard on the bottom of your library: You gain 2 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "When Daniels enters, return target creature card from your graveyard to your hand.",
    },
  ],
  // TODO(scaffold): {2}, Put this card from your graveyard on the bottom of your library: You gain 2 life.
});

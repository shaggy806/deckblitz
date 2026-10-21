import { defineCard } from "../define.js";

// "Populate. The token enters tapped and attacking": the `populate` effect
// spelled out (Game.populate is exactly this choose-permanents → copy of
// slot 0) so the copy can carry `tapped` and `attacking`. A copy that isn't a
// creature enters tapped but not attacking (rule 506.3 — the ruling), which
// putting a token into an attack already does; the player it attacks is the
// controller's choice (the ruling), and it was never declared, so "attacks"
// triggers don't see it (508.4).

export default defineCard({
  name: "Ghired, Conclave Exile",
  manaCost: "{2}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 5,
  text: "When Ghired enters, create a 4/4 green Rhino creature token with trample.\nWhenever Ghired attacks, populate. The token enters tapped and attacking. (To populate, create a token that's a copy of a creature token you control.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Rhino Token", count: 1 },
      resolve: null,
      text: "When Ghired enters, create a 4/4 green Rhino creature token with trample.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", token: true, controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "create-token-copy", of: 0, count: 1, tapped: true, attacking: "choose" },
        prompt: "Populate: choose a creature token to copy",
      },
      resolve: null,
      text: "Whenever Ghired attacks, populate. The token enters tapped and attacking.",
    },
  ],
});

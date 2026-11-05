import { defineCard } from "../define.js";

const ATTACKS =
  "Whenever Hans Eriksson attacks, reveal the top card of your library. If it's a creature card, put it onto the battlefield tapped and attacking defending player or a planeswalker they control. Otherwise, put that card into your hand. When you put a creature card onto the battlefield this way, it fights Hans Eriksson.";

// The fight is a second, reflexive ability players may respond to; with
// either creature gone (or no longer a creature) as it resolves, no damage
// is dealt (the rulings).
export default defineCard({
  name: "Hans Eriksson",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 1,
  toughness: 4,
  text: ATTACKS,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        enterTapped: true,
        attacking: { player: "trigger-player", orTheirPlaneswalker: true },
        leftover: "hand",
        then: {
          kind: "reflexive-trigger",
          about: "put-this-way",
          targets: [],
          effect: { kind: "fight", a: "trigger-object", b: "source" },
          text: "When you put a creature card onto the battlefield this way, it fights Hans Eriksson.",
        },
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});

import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever Durnan attacks, look at the top four cards of your library. You may exile a creature card from among them. Put the rest on the bottom of your library in any order. For as long as that card remains exiled, you may cast it. That spell has undaunted. (It costs {1} less to cast for each opponent.)";

// The exiled card is castable by Durnan's controller for as long as it stays
// exiled, by the normal timing and costs (its ruling), as modified by
// undaunted (rule 702.125): an impulse permission (`allow-cast-from-exile`'s
// `whileExiled`) carrying `undaunted`.
export default defineCard({
  name: "Durnan of the Yawning Portal",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${ATTACK_TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "exile",
        leftover: "bottom-any-order",
        then: { kind: "grant-play", cards: 0, duration: "while-exiled", undaunted: true },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  pairing: { kind: "choose-a-background" },
});

import { defineCard } from "../define.js";

// Rulings: the exiled card is cast while the trigger resolves, timing
// restrictions ignored, an {X} in it 0.

const GRANTED =
  "Whenever this creature deals combat damage to a player, look at that many cards from the top of your library. Exile up to one nonland card from among them and put the rest on the bottom of your library in a random order. You may cast the exiled card without paying its mana cost.";
const TEXT = `Until end of turn, target blocked creature you control gets +X/+0 and gains trample and "${GRANTED}"`;

export default defineCard({
  name: "Duelist's Flame",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", blocked: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: {
            kind: "look-and-choose",
            zone: "library",
            count: { triggerValue: true },
            min: 0,
            max: 1,
            filter: { notTypes: ["land"] },
            destination: "exile",
            unlinked: true,
            leftover: "bottom-random",
            then: { kind: "cast-now", target: 0, free: true },
          },
          resolve: null,
          text: GRANTED,
        },
      },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 8842.
//
// The granted ability turns its own face-down creature face up by an effect,
// nothing paid (rule 708.7). "If you can't" is that it's still face down
// afterwards: an instant or sorcery card is revealed and stays face down
// (701.40g, 701.58g), and so does one that can't be turned face up. Then it's
// exiled — a face-down permanent goes to exile face up — and its card may be
// cast as the ability resolves, free, whatever its type's timing (608.2g).
// One that has left the battlefield is neither turned up nor exiled: the
// condition reads it where it is now, not face down.
const GRANT_TEXT =
  "Face-down creatures you control have \"{2}{U}{B}: Turn this creature face up. If you can't, exile it, then you may cast the exiled card without paying its mana cost.\"";
const ABILITY_TEXT =
  "{2}{U}{B}: Turn this creature face up. If you can't, exile it, then you may cast the exiled card without paying its mana cost.";
const CLOAK_TEXT =
  "Whenever an Assassin you control deals combat damage to an opponent, cloak the top card of that player's library.";

export default defineCard({
  name: "Etrata, Deadly Fugitive",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Assassin"],
  power: 1,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${GRANT_TEXT}\n${CLOAK_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", faceDown: true } },
      grantsActivated: [
        {
          cost: { mana: "{2}{U}{B}", tap: false },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "turn-face-up", target: "source" },
              {
                kind: "conditional",
                condition: { kind: "source", filter: { faceDown: true } },
                then: {
                  kind: "sequence",
                  effects: [
                    { kind: "exile", target: "source" },
                    { kind: "cast-now", from: "source-exiled-this-way", free: true },
                  ],
                },
              },
            ],
          },
          resolve: null,
          text: ABILITY_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { subtype: "Assassin" },
        toOpponent: true,
      },
      targets: [],
      effect: { kind: "manifest", who: "you", cloak: true, from: "trigger-player" },
      resolve: null,
      text: CLOAK_TEXT,
    },
  ],
});

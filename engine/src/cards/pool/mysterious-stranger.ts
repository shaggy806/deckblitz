import { defineCard } from "../define.js";

// EDHREC rank 9358.
//
// Rulings:
//   [2024-03-08] You cast the copy while Mysterious Stranger's last ability is resolving and still
//     on the stack. You can't wait to cast it later in the turn.
//   [2024-03-08] If a spell has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2024-03-08] If you don't want to cast the copy, you can choose not to; the copy ceases to
//     exist the next time state-based actions are checked.
//   [2024-03-08] If you cast a spell "without paying its mana cost," you can't choose to cast it for
//     any alternative costs. You can, however, pay additional costs. If the spell has any mandatory
//     additional costs, those must be paid to cast the card.
//
// "For each graveyard with an instant or sorcery card in it, exile target …
// from that graveyard": a slot for each seat (`{ seat, ifAny: true }`), each
// required where that player's graveyard has one and defined nowhere else
// (rule 601.2c). The exiles are one instruction. "If two or more cards are
// exiled this way" — only then — one of them is picked at random
// (`choose-random-card` of `"exiled-this-way"`) and copied, the copy cast now
// for free or not at all (rule 707.12).

const TEXT =
  "When this creature enters, for each graveyard with an instant or sorcery card in it, exile target instant or sorcery card from that graveyard. If two or more cards are exiled this way, choose one of them at random and copy it. You may cast the copy without paying its mana cost.";

const SEATS = [0, 1, 2, 3] as const;

export default defineCard({
  name: "Mysterious Stranger",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: SEATS.map((seat) => ({
        kind: "card-in-graveyard" as const,
        whose: { seat, ifAny: true as const },
        filter: { typesAnyOf: ["instant", "sorcery"] },
      })),
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: SEATS.map((target) => ({ kind: "exile" as const, target })),
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", atLeast: 2 },
            then: {
              kind: "choose-random-card",
              zone: "exiled-this-way",
              then: { kind: "cast-now", target: 0, copies: 1, free: true },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

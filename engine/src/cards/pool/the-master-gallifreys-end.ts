import { defineCard } from "../define.js";

// Doctor Who. Myrkul, Lord of Bones' "you may exile it. If you do" — the card
// the creature became, while it's still that card in the graveyard (rule
// 400.7) — then the opponent is chosen among those tied for the most life as
// this resolves (`mostLife`), and faces Damocles Base's villainous choice:
// one of the two, their pick (rule 701.55a). "A copy of that card" is of the
// exiled card (`asCard`), not of the creature as it last existed.

const TEXT =
  "Make Them Pay — Whenever a nontoken artifact creature you control dies, you may exile it. If you do, choose an " +
  "opponent with the most life among your opponents. That player faces a villainous choice — They lose 4 life, or " +
  "you create a token that's a copy of that card.";

export default defineCard({
  name: "The Master, Gallifrey's End",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Rogue"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, types: ["artifact", "creature"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile it and have the opponent with the most life face a villainous choice?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "choose-opponent",
                mostLife: true,
                then: {
                  kind: "each-player-may",
                  who: "that-player",
                  choices: [
                    { text: "They lose 4 life.", effect: { kind: "lose-life", amount: 4, who: "that-player" } },
                    {
                      text: "You create a token that's a copy of that card.",
                      effect: { kind: "create-token-copy", of: "trigger-object", count: 1, who: "you", asCard: true },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

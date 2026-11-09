import { defineCard } from "../define.js";

const END_TEXT =
  "At the beginning of the next end step, if any of those cards remain exiled, put them into your graveyard, then create a 0/1 colorless Eldrazi Spawn creature token for each card put into your graveyard this way.";

export default defineCard({
  name: "Glimpse the Impossible",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: 'Exile the top three cards of your library. You may play those cards this turn. At the beginning of the next end step, if any of those cards remain exiled, put them into your graveyard, then create a 0/1 colorless Eldrazi Spawn creature token for each card put into your graveyard this way. Those tokens have "Sacrifice this token: Add {C}."',
  effect: {
    kind: "sequence",
    effects: [
      { kind: "impulse-exile", amount: 3, duration: "end-of-turn", play: true },
      {
        kind: "delayed-trigger",
        at: { step: "end" },
        about: "exiled",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "for-each-target", from: 0, effect: { kind: "put-into-graveyard", target: 0 } },
            { kind: "create-token", token: "Eldrazi Spawn Token", count: { thisWay: "put-into-graveyard" } },
          ],
        },
        text: END_TEXT,
      },
    ],
  },
});

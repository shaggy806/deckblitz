import { defineCard } from "../define.js";

export default defineCard({
  name: "Season of the Burrow",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Choose up to five {P} worth of modes. You may choose the same mode more than once.\n" +
    "{P} — Create a 1/1 white Rabbit creature token.\n" +
    "{P}{P} — Exile target nonland permanent. Its controller draws a card.\n" +
    "{P}{P}{P} — Return target permanent card with mana value 3 or less from your graveyard to the battlefield with an indestructible counter on it.",
  castModal: {
    minModes: 0,
    maxModes: 5,
    pawprintBudget: 5,
    repeatModes: true,
    modes: [
      {
        text: "{P} — Create a 1/1 white Rabbit creature token.",
        pawprints: 1,
        effect: { kind: "create-token", token: "Rabbit Token", count: 1 },
      },
      {
        text: "{P}{P} — Exile target nonland permanent. Its controller draws a card.",
        pawprints: 2,
        targets: [{ kind: "permanent", filter: { notTypes: ["land"] } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            { kind: "draw", who: { controllerOfTarget: 0 }, amount: 1 },
          ],
        },
      },
      {
        text: "{P}{P}{P} — Return target permanent card with mana value 3 or less from your graveyard to the battlefield with an indestructible counter on it.",
        pawprints: 3,
        targets: [
          { kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } } },
        ],
        effect: {
          kind: "put-onto-battlefield",
          target: 0,
          withCounters: { kind: "indestructible", amount: 1 },
        },
      },
    ],
  },
});

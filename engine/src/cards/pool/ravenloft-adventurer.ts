import { defineCard } from "../define.js";

// The hit counter is put on as the card arrives in exile (the replacement's
// `withCounters`). The attack trigger counts, from the defending player's
// side, the cards they own in exile with a hit counter on them.
export default defineCard({
  name: "Ravenloft Adventurer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Assassin"],
  power: 3,
  toughness: 4,
  text:
    "When this creature enters, you take the initiative.\n" +
    "If a creature an opponent controls would die, instead exile it and put a hit counter on it.\n" +
    "Whenever this creature attacks, if you've completed a dungeon, defending player loses 1 life for each card they own in exile with a hit counter on it.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this creature enters, you take the initiative.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "completed-dungeon" },
      targets: [],
      effect: {
        kind: "as-player",
        who: "trigger-player",
        effect: {
          kind: "lose-life",
          amount: {
            aggregate: "count",
            filter: { ownedBy: "you", counters: { kind: "hit", compare: { op: "gte", n: 1 } } },
            in: "exile",
          },
        },
      },
      resolve: null,
      text: "Whenever this creature attacks, if you've completed a dungeon, defending player loses 1 life for each card they own in exile with a hit counter on it.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", controlledBy: "opponent" },
        withCounters: { kind: "hit", amount: 1 },
      },
      text: "If a creature an opponent controls would die, instead exile it and put a hit counter on it.",
    },
  ],
});

import { defineCard } from "../define.js";

// "Does the same" is the whole first sentence: the opponent draws two and may
// exile too. The counters and suspend follow both exiles, all in one resolution,
// over everything exiled this way (a mana value of 0 gets no counter and so isn't
// suspended — the ruling).
export default defineCard({
  name: "The Wedding of River Song",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Draw two cards, then you may exile a nonland card from your hand with a number of time counters on it equal to its mana value. Then target opponent does the same. Cards exiled this way that don't have suspend gain suspend.\nTime travel. (For each suspended card you own and each permanent you control with a time counter on it, you may add or remove a time counter.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        filter: { notTypes: ["land"] },
        destination: "exile",
        leftover: "stay",
      },
      {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 2, who: "that-player" },
            {
              kind: "look-and-choose",
              player: "that-player",
              zone: "hand",
              min: 0,
              max: 1,
              filter: { notTypes: ["land"] },
              destination: "exile",
              leftover: "stay",
            },
          ],
        },
      },
      { kind: "give-suspend", timeCounters: "mana-value" },
      { kind: "time-travel" },
    ],
  },
});

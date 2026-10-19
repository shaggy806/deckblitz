import { defineCard } from "../define.js";

const DIES_TEXT =
  "When this creature dies, you may exile it and put three time counters on it. If you do, exile up to one target creature and put three time counters on it. Each card exiled this way that doesn't have suspend gains suspend. (For each card with suspend, its owner removes a time counter from it at the beginning of their upkeep. When the last is removed, they may cast it without paying its mana cost. Those creature spells have haste.)";

// Greenwarden of Murasa's "you may exile it. If you do" — the target is
// exiled only if this card really was — then every card exiled this way gets
// three time counters and suspend (The Parting of the Ways' `give-suspend`
// over the cards this resolution exiled).
export default defineCard({
  name: "Sinister Concierge",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "may",
        prompt: "Exile Sinister Concierge with three time counters (and up to one target creature with it)?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "sequence",
                effects: [
                  { kind: "exile", target: 0 },
                  { kind: "give-suspend", timeCounters: 3 },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// "Loki's power" is read as the spell is cast, so counters put on him after
// the ability resolves count: the filter's amount is read by the watch.
const COPY_TEXT =
  "When you next cast an instant or sorcery spell with mana value less than or equal to Loki's power this turn, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Loki Laufeyson",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["God", "Sorcerer", "Villain"],
  power: 2,
  toughness: 1,
  text: `{1}, {T}: ${COPY_TEXT}\nPower-up — {4}{R}: Put two +1/+1 counters on Loki. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          nextSpell: {
            typesAnyOf: ["instant", "sorcery"],
            manaValue: { op: "lte", n: { amount: { powerOf: "source" } } },
          },
        },
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
        text: COPY_TEXT,
      },
      resolve: null,
      text: `{1}, {T}: ${COPY_TEXT}`,
    },
    {
      cost: { mana: "{4}{R}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      powerUp: true,
      text: "Power-up — {4}{R}: Put two +1/+1 counters on Loki. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)",
    },
  ],
});

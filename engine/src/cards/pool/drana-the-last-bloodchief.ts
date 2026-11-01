import { defineCard } from "../define.js";

// Not targeted: the defending player chooses and it returns all as the ability
// resolves (the ruling). The counter is on it as it enters (rule 122.6), and it
// is a Vampire in addition to its other types from the moment it enters.
const TEXT =
  "Whenever Drana attacks, defending player chooses a nonlegendary creature card in your graveyard. You return that " +
  "card to the battlefield with an additional +1/+1 counter on it. The creature is a Vampire in addition to its " +
  "other types.";

export default defineCard({
  name: "Drana, the Last Bloodchief",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "trigger-player",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          chooser: "that-player",
          min: 1,
          max: 1,
          filter: { type: "creature", notSupertype: "legendary" },
          destination: "battlefield",
          withCounters: { kind: "+1/+1", amount: 1 },
          enterAs: { addSubtypes: ["Vampire"] },
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

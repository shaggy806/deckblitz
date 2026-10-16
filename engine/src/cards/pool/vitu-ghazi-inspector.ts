import { defineCard } from "../define.js";

// EDHREC rank 26391.
//
// "If evidence was collected" (rule 701.59c) is the spell having been cast
// with its collect-evidence additional cost paid — kicked — an
// intervening-if on the enters trigger. An illegal target fizzles the whole
// ability: no life either (the ruling).

const ENTER_TEXT =
  "When this creature enters, if evidence was collected, put a +1/+1 counter on target creature and you gain 2 life.";

export default defineCard({
  name: "Vitu-Ghazi Inspector",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Detective"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  kicker: { cost: "", keyword: "collect-evidence", collectEvidence: 6 },
  text: `As an additional cost to cast this spell, you may collect evidence 6. (Exile cards with total mana value 6 or greater from your graveyard.)\nReach\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

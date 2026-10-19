import { defineCard } from "../define.js";

// EDHREC rank 23537.
//
// "Enters from your graveyard" is Flayer of the Hatebound's filter: a card you
// own coming from a graveyard, whoever it enters under. The attach is Thornbite
// Staff's optional one onto the trigger's creature.
const PUMP_TEXT = "Equipped creature gets +1/+0 and has menace.";
const ATTACH_TEXT = "Whenever a creature enters from your graveyard, you may attach this Equipment to it.";

export default defineCard({
  name: "Dredging Claw",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT} (It can't be blocked except by two or more creatures.)\n${ATTACH_TEXT}\nEquip {1}{B} ({1}{B}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["menace"],
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: { type: "creature", enteredFrom: "graveyard", ownedBy: "you" },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Attach Dredging Claw to that creature?",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}{B}",
      sorcerySpeed: true,
    },
  ],
});

import { defineCard } from "../define.js";

const ENTERS =
  'When Dáin enters, create a colorless Equipment artifact token named Axe with "Equipped creature gets +1/+0" and equip {2}. When you do, attach it to target creature you control.';
const ATTACKS = "Whenever Dáin attacks, each equipped attacking creature gains double strike until end of turn.";

export default defineCard({
  name: "Dáin Ironfoot",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Dwarf", "Warrior"],
  power: 1,
  toughness: 4,
  text: `${ENTERS}\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Axe Token", count: 1 },
          {
            kind: "reflexive-trigger",
            about: "created",
            targets: ["creature-you-control"],
            effect: { kind: "attach", target: 0, attachment: "trigger-object" },
            text: "When you do, attach it to target creature you control.",
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", equipped: true, attacking: true },
        keyword: "double-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});

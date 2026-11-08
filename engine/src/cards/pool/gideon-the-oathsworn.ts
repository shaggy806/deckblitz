import { defineCard } from "../define.js";

// EDHREC rank 17845. "Those creatures" are the non-Gideon attackers that
// counted; an attacking Gideon creature gets nothing (the ruling).
const ATTACK_TEXT =
  "Whenever you attack with two or more non-Gideon creatures, put a +1/+1 counter on each of those creatures.";
const PLUS_TEXT =
  "+2: Until end of turn, Gideon becomes a 5/5 white Soldier creature that's still a planeswalker. Prevent all damage that would be dealt to him this turn. (He can't attack if he was cast this turn.)";
const ULT_TEXT = "−9: Exile Gideon and each creature your opponents control.";

export default defineCard({
  name: "Gideon, the Oathsworn",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Gideon"],
  loyalty: 4,
  text: `${ATTACK_TEXT}\n${PLUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 5,
            toughness: 5,
            addTypes: ["creature"],
            addSubtypes: ["Soldier"],
            setColors: ["W"],
            duration: "end-of-turn",
          },
          { kind: "prevent-damage", target: "source", amount: "all" },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: "source" },
          { kind: "exile-all", filter: { type: "creature", controlledBy: "opponent" } },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 2, filter: { type: "creature", notSubtypes: ["Gideon"] } },
      targets: [],
      effect: { kind: "add-counter-all", filter: { inSet: "trigger-batch" }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

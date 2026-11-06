import { defineCard } from "../define.js";

// Mystery Booster Commander. The artifact's mana value as it last existed on
// the battlefield (rule 608.2h).
const DIES =
  "Whenever an artifact is put into a graveyard from the battlefield, put a number of +1/+1 counters equal to that artifact's mana value on Joven and Chandler.";
const STEAL = "{R}{R}{R}, {T}: Gain control of target artifact until end of turn. Untap it. It gains haste until end of turn.";

export default defineCard({
  name: "Joven and Chandler",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: `${DIES}\n${STEAL}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "+1/+1",
        amount: { manaValueOf: "trigger-object" },
      },
      resolve: null,
      text: DIES,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}{R}{R}", tap: true },
      targets: ["artifact"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: STEAL,
    },
  ],
});

import { defineCard } from "../define.js";

// Oil counters as Archfiend of the Dross's (an enters replacement), spent
// as `removeCounter` costs (Gitaxian Raptor's).

const OIL_TEXT = "Migloz enters with five oil counters on it.";
const EVASION_TEXT = "{1}, Remove an oil counter from Migloz: It gains vigilance and menace until end of turn.";
const PUMP_TEXT = "{2}, Remove two oil counters from Migloz: It gets +2/+2 until end of turn.";
const DESTROY_TEXT = "{3}, Remove three oil counters from Migloz: Destroy target artifact or enchantment.";

export default defineCard({
  name: "Migloz, Maze Crusher",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 4,
  toughness: 4,
  text: `${OIL_TEXT}\n${EVASION_TEXT}\n${PUMP_TEXT}\n${DESTROY_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "oil", count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: EVASION_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false, removeCounter: { kind: "oil", count: 2 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      cost: { mana: "{3}", tap: false, removeCounter: { kind: "oil", count: 3 } },
      targets: ["artifact-or-enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 5 } },
      text: OIL_TEXT,
    },
  ],
});

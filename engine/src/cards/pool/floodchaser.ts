import { defineCard } from "../define.js";

// EDHREC rank 29500.

export default defineCard({
  name: "Floodchaser",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: "This creature enters with six +1/+1 counters on it.\nThis creature can't attack unless defending player controls an Island.\n{U}, Remove a +1/+1 counter from this creature: Target land becomes an Island until end of turn.",
  activated: [
    {
      cost: { mana: "{U}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["land"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Island"], duration: "end-of-turn" },
      resolve: null,
      text: "{U}, Remove a +1/+1 counter from this creature: Target land becomes an Island until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 6 } },
      text: "This creature enters with six +1/+1 counters on it.",
    },
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { subtype: "Island" } } }],
      text: "This creature can't attack unless defending player controls an Island.",
    },
  ],
});

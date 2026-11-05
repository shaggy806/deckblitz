import { defineCard } from "../define.js";

// EDHREC rank 28916.

export default defineCard({
  name: "Kukemssa Serpent",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 4,
  toughness: 3,
  text: "This creature can't attack unless defending player controls an Island.\n{U}, Sacrifice an Island: Target land an opponent controls becomes an Island until end of turn.\nWhen you control no Islands, sacrifice this creature.",
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: { filter: { subtype: "Island" } } },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "land" } }],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Island"], duration: "end-of-turn" },
      resolve: null,
      text: "{U}, Sacrifice an Island: Target land an opponent controls becomes an Island until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "not", of: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you control no Islands, sacrifice this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { subtype: "Island" } },
      text: "This creature can't attack unless defending player controls an Island.",
    },
  ],
});

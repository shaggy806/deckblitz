import { defineCard } from "../define.js";

export default defineCard({
  name: "Barkhide Troll",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 2,
  toughness: 2,
  text: "This creature enters with a +1/+1 counter on it.\n{1}, Remove a +1/+1 counter from this creature: This creature gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: "{1}, Remove a +1/+1 counter from this creature: This creature gains hexproof until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "This creature enters with a +1/+1 counter on it.",
    },
  ],
});

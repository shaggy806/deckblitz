import { defineCard } from "../define.js";

// EDHREC rank 6564.

export default defineCard({
  name: "Plaxcaster Frogling",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Frog", "Mutant"],
  power: 0,
  toughness: 0,
  text: "Graft 3 (This creature enters with three +1/+1 counters on it. Whenever another creature enters, you may move a +1/+1 counter from this creature onto it.)\n{2}: Target creature with a +1/+1 counter on it gains shroud until end of turn. (It can't be the target of spells or abilities.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [
        { kind: "permanent", filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "shroud", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: Target creature with a +1/+1 counter on it gains shroud until end of turn.",
    },
  ],
  // Graft 3 (rule 702.58a): "This permanent enters with three +1/+1
  // counters on it" and "Whenever another creature enters, if this permanent
  // has a +1/+1 counter on it, you may move a +1/+1 counter from this
  // permanent onto that creature" — an intervening if (603.4), and a move
  // (122.5).
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from Plaxcaster Frogling onto the creature that entered?",
        effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" },
      },
      resolve: null,
      text: "Graft 3",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "Graft 3",
    },
  ],
});

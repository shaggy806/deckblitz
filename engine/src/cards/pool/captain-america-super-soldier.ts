import { defineCard } from "../define.js";

// EDHREC rank 10514.

export default defineCard({
  name: "Captain America, Super-Soldier",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\nCaptain America enters with a shield counter on him. (If he would be dealt damage or destroyed, remove a shield counter from him instead.)\nAs long as Captain America has a shield counter on him, you and other Heroes you control have hexproof.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "shield", amount: 1 } },
      text: "Captain America enters with a shield counter on him.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "shield", compare: { op: "gte", n: 1 } },
      playerHexproof: true,
      text: "As long as Captain America has a shield counter on him, you and other Heroes you control have hexproof.",
    },
    {
      affects: { scope: "filter", filter: { subtype: "Hero", controlledBy: "you" }, excludeSelf: true },
      condition: { kind: "self-counters", counter: "shield", compare: { op: "gte", n: 1 } },
      grantKeywords: ["hexproof"],
      text: "As long as Captain America has a shield counter on him, you and other Heroes you control have hexproof.",
    },
  ],
});

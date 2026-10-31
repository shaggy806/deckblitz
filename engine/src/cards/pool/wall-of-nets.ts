import { defineCard } from "../define.js";

// Linked abilities (rule 607.2a): each exile is "with"
// this stint, and the leaves trigger returns every card it exiled. "Blocked
// by this creature" is read as the end of combat step begins, before combat
// ends (rule 511.3): an attacker removed from combat since is no longer
// blocked by it (506.4).
const END_TEXT = "At end of combat, exile all creatures blocked by this creature.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, return all cards exiled with it to the battlefield under their owners' control.";

export default defineCard({
  name: "Wall of Nets",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 7,
  keywords: ["defender"],
  text: `Defender\n${END_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end-combat", who: "any" },
      targets: [],
      effect: {
        kind: "exile-all",
        filter: { type: "creature", blockingRelation: { relation: "blocked-by" } },
        linked: true,
      },
      resolve: null,
      text: END_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});

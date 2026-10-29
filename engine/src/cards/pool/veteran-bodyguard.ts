import { defineCard } from "../define.js";

// EDHREC rank 28127.
//
// A static redirection (rule 614.9) while it's untapped — blocking included
// (the ruling). "Unblocked" is an attacking creature with blockers declared
// and none blocking it (rule 509.1h), so a blocked trampler's damage stays
// yours (the ruling).

const TEXT =
  "As long as this creature is untapped, all damage that would be dealt to you by unblocked creatures is dealt to this creature instead.";

export default defineCard({
  name: "Veteran Bodyguard",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      replacement: {
        event: "would-deal-damage",
        to: "you",
        source: { type: "creature", unblocked: true },
        redirect: "self",
      },
      text: TEXT,
    },
  ],
});

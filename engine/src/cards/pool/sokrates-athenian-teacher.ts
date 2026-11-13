import { defineCard } from "../define.js";

const HEXPROOF_TEXT = "Sokrates has hexproof as long as it's untapped.";
const GRANTED_TEXT =
  "If this creature would deal combat damage to a player, prevent that damage. This creature's controller and that player each draw half that many cards, rounded down.";
const DIALOGUE_TEXT = `Sokratic Dialogue — {T}: Until end of turn, target creature gains "${GRANTED_TEXT}"`;

// EDHREC rank 4617. The granted ability is the creature's own static (it
// works from that creature, so "this creature's controller" is "you" there,
// and a later loss of all abilities takes it away, rule 613.7). Its follow-up
// (rule 615.5) reads "that player" as the player the damage would have been
// dealt to, and still draws when the damage can't be prevented (the ruling;
// rule 615.12 — `thenCountsUnprevented`).
export default defineCard({
  name: "Sokrates, Athenian Teacher",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${HEXPROOF_TEXT}\n${DIALOGUE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "grant-static",
        target: 0,
        ability: {
          affects: { scope: "self" },
          replacement: {
            event: "would-deal-damage",
            combat: true,
            fromSelf: true,
            to: "player",
            instead: {
              prevent: true,
              thenCountsUnprevented: true,
              then: {
                kind: "sequence",
                effects: [
                  { kind: "draw", amount: { half: "x", round: "down" } },
                  { kind: "draw", amount: { half: "x", round: "down" }, who: "trigger-player" },
                ],
              },
            },
          },
          text: GRANTED_TEXT,
        },
        duration: "end-of-turn",
      },
      resolve: null,
      text: DIALOGUE_TEXT,
    },
  ],
});

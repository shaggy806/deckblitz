import { defineCard } from "../define.js";

// Innistrad: Midnight Hunt (MID).
//
// The death replacement exiles the card *with* Gisa (rule 607.2a — the replacement's `linked`),
// so only this Gisa's upkeep trigger finds it: a Gisa that leaves and returns is a new object
// (rule 400.7) and its trigger finds nothing. A card Rest in Peace could exile instead isn't
// linked (rule 616.1: the dying creature's controller picks). A token exiled this way ceases to
// exist. "They gain decayed" is an effect of the resolution, begun once they're on the
// battlefield, lasting as long as each stays there.
const REPLACE_TEXT = "If a creature an opponent controls would die, exile it instead.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, put all creature cards exiled with Gisa onto the battlefield under your control. They gain decayed. (A creature with decayed can't block. When it attacks, sacrifice it at end of combat.)";

export default defineCard({
  name: "Gisa, Glorious Resurrector",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 4,
  text: `${REPLACE_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", controlledBy: "opponent" },
        linked: true,
      },
      text: REPLACE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "return-exiled-by-source",
            linked: "battlefield",
            under: "you",
            filter: { type: "creature" },
          },
          {
            kind: "grant-keyword-all",
            filter: { thisWay: "put-onto-battlefield" },
            keyword: "decayed",
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});

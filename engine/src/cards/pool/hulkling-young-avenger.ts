import { defineCard } from "../define.js";

// EDHREC rank 19741.
//
// Hulkling copies the target's copiable values as the ability resolves —
// what it is copying, if it's a copy — not its counters, tapped state or
// other effects on it, and keeps his own (rule 707.2). His name, base 4/4,
// flying and this ability are copiable exceptions (rule 707.9b), so he goes
// on triggering while he's a copy. He isn't legendary unless what he copies
// is. With no target chosen nothing happens; a target gone illegal as it
// resolves does nothing either (rule 608.2b). In the cleanup step he is
// himself again (rule 514.2).
const COPY_TEXT =
  "Whenever you cast a noncreature spell, Hulkling becomes a copy of up to one other target creature until end of turn, except his name is Hulkling, Young Avenger, he's 4/4, and he has flying and this ability.";

export default defineCard({
  name: "Hulkling, Young Avenger",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kree", "Skrull", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        until: "end-of-turn",
        exceptions: {
          name: "Hulkling, Young Avenger",
          basePt: [4, 4],
          keywords: ["flying"],
          thisAbility: { card: "Hulkling, Young Avenger", triggered: 0 },
        },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});

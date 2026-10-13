import { defineCard } from "../define.js";

// EDHREC rank 11165.
//
// Each creature you control but the target — Loki too, unless he's the one —
// copies the target's copiable values as they were as it resolved (what it
// copies, if it's a copy), except it isn't legendary (rule 707.9b), until the
// cleanup step (rule 514.2). Each keeps its counters, status and the
// non-copy effects on it (rule 707.4); Loki, a copy, no longer has this
// ability until then.
const TEXT =
  "{U}, {T}: Choose target creature you control. Each creature you control other than the chosen creature becomes a copy of that creature until end of turn, except it isn't legendary. Activate only as a sorcery.";

export default defineCard({
  name: "Loki, Lord of Misrule",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Sorcerer", "Villain"],
  power: 3,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "become-copy",
        filter: { type: "creature", controlledBy: "you" },
        exceptOf: true,
        of: 0,
        until: "end-of-turn",
        exceptions: { notLegendary: true },
      },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});

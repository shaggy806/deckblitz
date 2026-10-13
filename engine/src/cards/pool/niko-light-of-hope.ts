import { defineCard } from "../define.js";

// EDHREC rank 8785.
//
// The Shards copy the creature as it last existed on the battlefield — its
// copiable values (what it copied, if it was a copy; an {X} in its cost is
// 0), not its counters, attachments, tapped state or the non-copy effects on
// it (the rulings, rule 608.2h). They stay the same permanents (rule 707.4)
// and are Shards again as the next end step begins, when the delayed
// trigger returns the creature — a new object, under its owner's control. An
// illegal target stops all of it (rule 608.2b).
const SHARDS_TEXT = "When Niko enters, create two Shard tokens.";
const COPY_TEXT =
  "{2}, {T}: Exile target nonlegendary creature you control. Shards you control become copies of it until the next end step. Return it to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Niko, Light of Hope",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  text: `When Niko enters, create two Shard tokens. (They're enchantments with "{2}, Sacrifice this token: Scry 1, then draw a card.")\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", notSupertype: "legendary" } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "flicker",
            target: 0,
            returnAt: "next-end-step",
            returnText: "Return the exiled card to the battlefield under its owner's control.",
          },
          {
            kind: "become-copy",
            filter: { subtype: "Shard", controlledBy: "you" },
            of: 0,
            until: "next-end-step",
          },
        ],
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Shard Token", count: 2 },
      resolve: null,
      text: SHARDS_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 17626. Marvel Super Heroes Commander.
//
// A Vehicle with no crew: it becomes a creature only through its first
// trigger, which is crew's own effect (`add-types`, until end of turn). The
// fourth noncreature spell counts noncreature spells only (`nthEachTurn`
// with a filter counts matching spells), judged as each spell was cast. On
// that spell both abilities trigger. "If you do" is `sacrifice-source`'s
// `then`: a Fantasticar gone in response makes no Constructs.
const ANIMATE_TEXT =
  "Whenever you cast a noncreature spell, you may have The Fantasticar become an artifact creature until end of turn.";
const FOURTH_TEXT =
  "Whenever you cast your fourth noncreature spell each turn, you may sacrifice The Fantasticar. If you do, create four 4/4 colorless Construct artifact creature tokens with flying and haste.";

export default defineCard({
  name: "The Fantasticar",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ANIMATE_TEXT}\n${FOURTH_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have The Fantasticar become an artifact creature until end of turn?",
        effect: { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 4, filter: { notTypes: ["creature"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice The Fantasticar to create four 4/4 Construct tokens with flying and haste?",
        effect: {
          kind: "sacrifice-source",
          then: { kind: "create-token", token: "Construct Token (The Fantasticar)", count: 4 },
        },
      },
      resolve: null,
      text: FOURTH_TEXT,
    },
  ],
});

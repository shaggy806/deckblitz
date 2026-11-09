import { defineCard } from "../define.js";

// EDHREC rank 2717. "One of them": the batch's creatures that entered or were
// cast from a graveyard, one chosen as this resolves.

const SURVEIL_TEXT = "When this creature enters, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)";
const COPY_TEXT =
  "Whenever one or more other creatures you control enter, if they entered or were cast from a graveyard, create a token that's a copy of one of them. This ability triggers only once each turn.";

const FROM_GRAVEYARD = {
  type: "creature",
  anyOf: [{ enteredFrom: "graveyard" }, { castFrom: "graveyard" }],
} as const;

export default defineCard({
  name: "Twilight Diviner",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 3,
  toughness: 3,
  text: `${SURVEIL_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", otherOnly: true, batched: true, filter: FROM_GRAVEYARD },
      oncePerTurn: true,
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { inSet: "trigger-batch", ...FROM_GRAVEYARD },
        upTo: 1,
        min: 1,
        prompt: "Create a token that's a copy of one of them.",
        then: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});

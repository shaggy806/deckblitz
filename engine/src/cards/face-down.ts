/**
 * The face-down 2/2s (rule 708.2a): the characteristics a face-down permanent
 * has — "a 2/2 face-down creature with no text, no name, no subtypes, and no
 * mana cost" (manifest, 701.40a), with ward {2} if cloaked (701.58a). Not
 * cards: no deck holds them and `card:verify` never sees them (they aren't in
 * `pool/` or `tokens/`), so `createDefaultRegistry` registers them by hand.
 * The names are registry keys only — `FACE_DOWN_CARDS` in `state.ts` — and a
 * face-down permanent has no name (708.2a), which `nameOf` answers.
 */

import { FACE_DOWN_AS_CARDS, FACE_DOWN_CARDS } from "../state.js";
import { defineCard } from "./define.js";
import type { CardDefinition } from "./define.js";
import { ward } from "./helpers.js";

const NOTED_COPY_TEXT =
  "Whenever this creature deals combat damage to a player, you may create a copy of the card with the noted name. You may cast the copy without paying its mana cost.";
const EXILE_IF_LEAVES_TEXT = "If this creature would leave the battlefield, exile it instead of putting it anywhere else.";

export const FACE_DOWN_DEFINITIONS: readonly CardDefinition[] = [
  defineCard({
    name: FACE_DOWN_CARDS.manifest,
    colors: [],
    types: ["creature"],
    power: 2,
    toughness: 2,
    text: "",
  }),
  defineCard({
    name: FACE_DOWN_CARDS.cloak,
    colors: [],
    types: ["creature"],
    power: 2,
    toughness: 2,
    text: "Ward {2}",
    triggered: [ward({ mana: "{2}" })],
  }),
  // The characteristics an effect lists for what it puts or turns face down
  // (rule 708.2 — `FaceDownAs`): no name, text or mana cost beyond them.
  defineCard({
    name: FACE_DOWN_AS_CARDS["2/2 Cyberman artifact creature"],
    colors: [],
    types: ["artifact", "creature"],
    subtypes: ["Cyberman"],
    power: 2,
    toughness: 2,
    text: "",
  }),
  defineCard({
    name: FACE_DOWN_AS_CARDS["2/2 Horror creature"],
    colors: [],
    types: ["creature"],
    subtypes: ["Horror"],
    power: 2,
    toughness: 2,
    text: "",
  }),
  defineCard({
    name: FACE_DOWN_AS_CARDS["5/5 artifact creature"],
    colors: [],
    types: ["artifact", "creature"],
    power: 5,
    toughness: 5,
    text: "",
  }),
  // A Forest land: its "{T}: Add {G}" is Forest's intrinsic ability (rule
  // 305.6), which `intrinsicManaColors` gives it from the subtype.
  defineCard({
    name: FACE_DOWN_AS_CARDS["Forest land"],
    colors: [],
    types: ["land"],
    subtypes: ["Forest"],
    text: "",
  }),
  // Magar of the Magic Strings' "It's a 3/3 creature with …" (rule 707.14):
  // the two abilities are its copiable values, the noted name isn't (the
  // ruling) — a copy of it makes no copy of anything.
  defineCard({
    name: FACE_DOWN_AS_CARDS["3/3 creature that copies the noted card"],
    colors: [],
    types: ["creature"],
    power: 3,
    toughness: 3,
    text: `${NOTED_COPY_TEXT}\n${EXILE_IF_LEAVES_TEXT}`,
    triggered: [
      {
        trigger: { on: "deals-combat-damage-to-player", who: "self" },
        targets: [],
        effect: { kind: "cast-now", copyOfCardNamed: { noted: "source" }, copyOutsideTheGame: true, free: true },
        resolve: null,
        text: NOTED_COPY_TEXT,
      },
    ],
    static: [{ affects: { scope: "self" }, exileIfLeaves: true, text: EXILE_IF_LEAVES_TEXT }],
  }),
];

import { defineCard } from "../define.js";

// EDHREC rank 11717.
//
// - "Whenever a player casts an instant or sorcery **card**": `isCopy: false`,
//   so the copies this casts (rule 707.12) never trigger it again (the
//   ruling).
// - The cast spell is exiled from the stack linked to this (rule 607.2a), so
//   it never resolves; then that player copies every card exiled with it — any
//   owner's (the ruling) — and casts any of the copies free, in the order they
//   choose (Arcane Bombardment's `cast-now` over `exiled-with-source`, as that
//   player, as Knowledge Pool's is). X is 0 and no alternative cost can be
//   paid (rule 601.2b's free cast); additional costs, replicate included, can.

const TEXT =
  "Whenever a player casts an instant or sorcery card, exile it. Then that player copies each instant or sorcery card exiled with this enchantment. For each copy, the player may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Eye of the Storm",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { typesAnyOf: ["instant", "sorcery"], isCopy: false } },
      targets: [],
      effect: {
        kind: "as-player",
        who: "trigger-player",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object", linked: true },
            { kind: "cast-now", from: "exiled-with-source", copies: 1, free: true, repeat: true },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

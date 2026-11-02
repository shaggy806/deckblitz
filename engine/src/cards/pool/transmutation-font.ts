import { defineCard } from "../define.js";

const MAKE_TEXT = "{T}: Create your choice of a Blood token, a Clue token, or a Food token.";
const SEARCH_TEXT =
  "{3}, {T}, Sacrifice three artifact tokens with different names: Search your library for an artifact card, put it onto the battlefield, then shuffle. Activate only as a sorcery.";

// "With different names": asked one at a time, each offering only the names not
// yet chosen; the activation needs three names among them.
export default defineCard({
  name: "Transmutation Font",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `${MAKE_TEXT}\n${SEARCH_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Create a Blood token.", effect: { kind: "create-token", token: "Blood Token", count: 1 } },
          { text: "Create a Clue token.", effect: { kind: "create-token", token: "Clue Token", count: 1 } },
          { text: "Create a Food token.", effect: { kind: "create-token", token: "Food Token", count: 1 } },
        ],
      },
      resolve: null,
      text: MAKE_TEXT,
    },
    {
      cost: {
        mana: "{3}",
        tap: true,
        sacrifice: { filter: { type: "artifact", token: true }, count: 3, differentNames: true },
      },
      targets: [],
      effect: { kind: "search-library", filter: { type: "artifact" }, destination: "battlefield", min: 0, max: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: SEARCH_TEXT,
    },
  ],
});

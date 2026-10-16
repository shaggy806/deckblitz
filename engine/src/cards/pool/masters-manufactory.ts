import { defineCard } from "../define.js";

const TEXT =
  "{T}: Create a 4/4 white and blue Golem artifact creature token. Activate only if this artifact or another artifact entered the battlefield under your control this turn.";

export default defineCard({
  name: "Master's Manufactory",
  art: "https://cards.scryfall.io/art_crop/back/f/7/f7a41343-7cdb-49aa-a9d1-7460195355d8.jpg",
  colors: ["W", "U"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      // Any artifact that entered under your control this turn, this one
      // included, matched as it entered — the ruling: it counts though it has
      // left the battlefield, stopped being an artifact or changed control.
      condition: { kind: "turn-history", what: "entered", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "create-token", token: "Golem Token (Master's Guide-Mural // Master's Manufactory)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Master's Guide-Mural", "Master's Manufactory"],
  transform: true,
});

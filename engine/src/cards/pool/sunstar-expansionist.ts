import { defineCard } from "../define.js";

// EDHREC rank 17143. Makes a Lander. Dora Milaje Elite's intervening-if.

const ENTER_TEXT =
  "When this creature enters, if an opponent controls more lands than you, create a Lander token.";
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, this creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Sunstar Expansionist",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT} (It's an artifact with "{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.")\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "opponent-controls-more", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Lander Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});

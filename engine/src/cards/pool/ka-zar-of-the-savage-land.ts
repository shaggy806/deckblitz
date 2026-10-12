import { defineCard } from "../define.js";

// EDHREC rank 15061. Marvel Super Heroes. Elven Chorus's look at the top
// card, Courser of Kruphix's lands from the top, and a token named Zabu.

const LOOK_TEXT = "You may look at the top card of your library any time.";
const PLAY_TEXT = "You may play lands from the top of your library.";
const ENTER_TEXT =
  'When Ka-Zar enters, create Zabu, a legendary 2/2 green Cat creature token with "Landfall — Whenever a land you control enters, put a +1/+1 counter on Zabu."';

export default defineCard({
  name: "Ka-Zar of the Savage Land",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian", "Hero"],
  power: 3,
  toughness: 2,
  text: `${LOOK_TEXT}\n${PLAY_TEXT}\n${ENTER_TEXT}`,
  looksAtOwnLibraryTop: true,
  static: [{ affects: { scope: "self" }, playFromLibraryTop: { type: "land" }, text: PLAY_TEXT }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zabu", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 31863.
//
// Rulings:
//   [2006-07-15] If Sound the Call resolves while all graveyards are empty, first a 1/1 token is
//     created, then the Sound the Call card is put into your graveyard, which makes the token 2/2.

export default defineCard({
  name: "Sound the Call",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: 'Create a 1/1 green Wolf creature token. It has "This token gets +1/+1 for each card named Sound the Call in each graveyard."',
  targets: [],
  effect: { kind: "create-token", token: "Wolf Token (Sound the Call)", count: 1 },
});

import { defineCard } from "../define.js";


export default defineCard({
  name: "Awaken the Blood Avatar",
  art: "https://cards.scryfall.io/art_crop/back/b/a/ba09360a-067e-48a5-bdc5-a19fd066a785.jpg",
  manaCost: "{6}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, you may sacrifice any number of creatures. This spell costs {2} less to cast for each creature sacrificed this way.\nEach opponent sacrifices a creature of their choice. Create a 3/6 black and red Avatar creature token with haste and \"Whenever this token attacks, it deals 3 damage to each opponent.\"",
  faces: ["Extus, Oriq Overlord", "Awaken the Blood Avatar"],
  // How many creatures is announced as it's cast, each taking {2} off the
  // generic part — never below {B}{R}, though any number may go (the
  // rulings); commander tax is added first. The Avatar comes whether or not
  // anyone had a creature to sacrifice (the ruling).
  additionalCost: { sacrifice: { type: "creature" }, sacrificeCount: "x", sacrificeReduces: 2 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      { kind: "create-token", token: "Avatar Token (Awaken the Blood Avatar)", count: 1 },
    ],
  },
});

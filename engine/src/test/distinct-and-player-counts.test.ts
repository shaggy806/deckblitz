/**
 * New amounts (the `effect:amount-new-variants` family): a `distinct`
 * aggregate — the different mana values, powers or names among permanents or
 * graveyard cards — read by an effect, a static condition, a conditional
 * activation cost reduction and a characteristic-defining ability; a
 * `countInGraveyard` from one player's side (`forTarget`, `forPlayer`);
 * "Equipment attached to it" (`isSource`); `countPlayers`' `where`; and
 * counts read from the defending player's or each opponent's side.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
} from "./harness.js";

const stock = (game: Game, player: PlayerId = A, n = 10): void => {
  for (let i = 0; i < n; i += 1) toLibrary(game, "Wastes", player);
};
const attachTo = (game: Game, equipment: ObjectId, host: ObjectId): void => {
  game.state.objects[equipment].attachedTo = host;
};
/** Cards of mana value 0 (a land), 1, 2, 3 and 4. */
const FIVE_VALUES = ["Wastes", "Llanowar Elves", "Grizzly Bears", "Divination", "Hill Giant"];

describe("distinct aggregates", () => {
  it("Lunar Insight: a card for each different mana value among nonland permanents you control", () => {
    const { game } = table();
    stock(game);
    lands(game, "Island", 3);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves");
    spawn(game, "Hill Giant");
    spawn(game, "Serra Angel", B); // not yours
    const before = hand(game).length;
    cast(game, toHand(game, "Lunar Insight"));
    // 2, 1 and 4: the second Bears and the lands add nothing.
    expect(hand(game).length).toBe(before + 3);
  });

  it("Golden Ratio: a card for each different power among creatures you control", () => {
    const { game } = table();
    stock(game);
    lands(game, "Island", 2);
    lands(game, "Forest", 1);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves");
    spawn(game, "Serra Angel");
    const before = hand(game).length;
    cast(game, toHand(game, "Golden Ratio"));
    expect(hand(game).length).toBe(before + 3); // 2, 1, 4
  });

  it("Aven Heartstabber: +2/+2 and deathtouch with five or more mana values among cards in your graveyard", () => {
    const { game } = table();
    const aven = spawn(game, "Aven Heartstabber");
    for (const name of FIVE_VALUES.slice(0, 4)) toGraveyard(game, name);
    toGraveyard(game, "Grizzly Bears"); // a second 2
    toGraveyard(game, "Hill Giant", B); // an opponent's card doesn't count
    expect(pt(game, aven)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, aven).has("deathtouch")).toBe(false);
    toGraveyard(game, "Hill Giant"); // the fifth: 0, 1, 2, 3, 4
    expect(pt(game, aven)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, aven).has("deathtouch")).toBe(true);
  });

  it("Sewer Crocodile: its ability costs {3} less only with five mana values in your graveyard", () => {
    const { game } = table();
    const croc = spawn(game, "Sewer Crocodile");
    lands(game, "Island", 1);
    for (const name of FIVE_VALUES.slice(0, 4)) toGraveyard(game, name);
    expect(() => activate(game, croc)).toThrow(/refused/);
    toGraveyard(game, "Hill Giant");
    activate(game, croc);
    expect(keywords(game, croc).has("unblockable")).toBe(true);
  });

  it("Awakened Amalgam: power and toughness equal to the differently named lands you control", () => {
    const { game } = table();
    const amalgam = spawn(game, "Awakened Amalgam");
    lands(game, "Plains", 2);
    lands(game, "Forest", 1);
    lands(game, "Island", 1, B); // theirs
    expect(pt(game, amalgam)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Island", 1);
    expect(pt(game, amalgam)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("graveyard counts from one player's side", () => {
  it("Corpse Augur: X is the creature cards in the target player's graveyard", () => {
    const { game, a } = table();
    stock(game);
    const augur = spawn(game, "Corpse Augur");
    for (const name of ["Grizzly Bears", "Hill Giant", "Serra Angel"]) toGraveyard(game, name, B);
    toGraveyard(game, "Wastes", B); // not a creature card
    toGraveyard(game, "Grizzly Bears"); // in Alice's graveyard
    pickTargets(a, B);
    const [handBefore, lifeBefore] = [hand(game).length, life(game)];
    destroy(game, augur);
    settle(game);
    expect(hand(game).length).toBe(handBefore + 3);
    expect(life(game)).toBe(lifeBefore - 3);
  });

  it("Roiling Terrain: damage to the land's controller equal to the land cards in their graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const forest = spawn(game, "Forest", B);
    toGraveyard(game, "Forest", B);
    toGraveyard(game, "Forest", B);
    toGraveyard(game, "Plains"); // Alice's
    cast(game, toHand(game, "Roiling Terrain"), { targets: [ref(forest)] });
    // The destroyed Forest is among them by now: three.
    expect(life(game, B)).toBe(17);
  });
});

describe("Equipment attached to it", () => {
  it("Goblin Gaveleer: +2/+0 for each Equipment attached to it, not to another creature", () => {
    const { game } = table();
    const goblin = spawn(game, "Goblin Gaveleer");
    const bears = spawn(game, "Grizzly Bears");
    const [one, two, other] = [spawn(game, "Short Sword"), spawn(game, "Short Sword"), spawn(game, "Short Sword")];
    attachTo(game, one, goblin);
    attachTo(game, two, goblin);
    attachTo(game, other, bears);
    // 1/1, +2/+0 twice, and each Short Sword's own +1/+1.
    expect(pt(game, goblin)).toEqual({ power: 7, toughness: 3 });
  });

  it("Kemba, Kha Regent: a Cat for each Equipment attached to Kemba at your upkeep", () => {
    const { game } = table();
    stock(game, A);
    stock(game, B);
    const kemba = spawn(game, "Kemba, Kha Regent");
    attachTo(game, spawn(game, "Short Sword"), kemba);
    attachTo(game, spawn(game, "Bonesplitter", B), kemba); // whoever controls it
    attachTo(game, spawn(game, "Short Sword"), spawn(game, "Grizzly Bears"));
    nextTurn(game); // Bob's
    nextTurn(game); // Alice's
    expect(tokensNamed(game, "Cat Token", A)).toBe(2);
  });
});

describe("counting players", () => {
  it("Oreskos Explorer: up to X Plains, X the players who control more lands than you", () => {
    const { game, a } = table({ players: 3 });
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Plains");
    lands(game, "Plains", 2);
    lands(game, "Forest", 3, B);
    lands(game, "Forest", 2, C); // as many as Alice: not more
    let offeredMax = -1;
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      offeredMax = max;
      return eligible.slice(0, max);
    };
    const handBefore = hand(game).length;
    enter(game, "Oreskos Explorer");
    expect(offeredMax).toBe(1);
    expect(hand(game).length).toBe(handBefore + 1);
  });

  it("Priest of the Blessed Graf: a Spirit for each opponent who controls more lands than you", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Priest of the Blessed Graf");
    lands(game, "Plains", 2);
    lands(game, "Forest", 3, B);
    lands(game, "Forest", 1, C);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });

  it("Terra Ravager: +X/+0, X the lands the defending player controls", () => {
    const { game, a } = table({ players: 3 });
    const ravager = spawn(game, "Terra Ravager");
    lands(game, "Forest", 3, B);
    lands(game, "Forest", 5, C);
    lands(game, "Mountain", 2);
    attack(game, a, [ravager], B);
    expect(pt(game, ravager)).toEqual({ power: 3, toughness: 4 });
  });

  it("Treacherous Terrain: each opponent is dealt damage equal to the lands they control", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 4);
    lands(game, "Forest", 4);
    lands(game, "Forest", 2, B);
    lands(game, "Forest", 5, C);
    cast(game, toHand(game, "Treacherous Terrain"));
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 18, 15]);
  });
});

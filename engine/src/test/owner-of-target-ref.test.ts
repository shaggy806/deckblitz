/**
 * A player named as the owner, not the controller, of a target or of the
 * object behind a trigger, for a later effect (rule 108.3: an owner never
 * changes). `{ ownerOfTarget }` on `gain-life`, `lose-life`, `damage`, `mill`
 * and `exile-graveyard` beside `draw` and `discard`'s; `"attached-owner"` on
 * `damage`, with `from: "attached"`; the `"trigger-owner"` scope.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, activate, cast, controller, graveyard, hand, lands, life, named, nextTurn, ref, settle, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

const takeControl = (game: Game, id: ObjectId, to: PlayerId): void => {
  game.state.objects[id].controller = to;
};

describe("{ ownerOfTarget }: the owner, whoever controls it", () => {
  it("Path of Peace: its owner gains 4 life, not its controller", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    takeControl(game, bears, C);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Path of Peace"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(24);
    expect(life(game, C)).toBe(20);
    expect(life(game, A)).toBe(20);
  });

  it("Recoil: that player is the owner whose hand it went to, and they choose their discard", () => {
    const { game, b } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    takeControl(game, bears, C);
    const other = toHand(game, "Shock", B);
    const held = toHand(game, "Shock", C);
    b.chooseDiscardsFn = () => [other];
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Recoil"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, B)).toContain(bears);
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, held)).toBe("hand");
  });

  it("Recoil: a token's owner discards, though the token is gone", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Raise the Alarm"));
    const [soldier] = named(game, "Soldier Token", A);
    expect(soldier).toBeDefined();
    const held = hand(game, A).length;
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Recoil"), { targets: [ref(soldier)] });
    expect(hand(game, A).length).toBe(held - 1);
    expect(graveyard(game, A).length).toBe(3);
  });

  it("Geth: that player mills X, and X is exactly the card's mana value", () => {
    const { game } = table();
    const geth = spawn(game, "Geth, Lord of the Vault", A);
    const piker = toGraveyard(game, "Goblin Piker", B);
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Wastes", B);
    const before = game.state.zones.perPlayer[B].library.length;
    lands(game, "Swamp", 3);
    activate(game, geth, 0, { targets: [ref(piker)], x: 2 });
    expect(zone(game, piker)).toBe("battlefield");
    expect(controller(game, piker)).toBe(A);
    expect(game.state.objects[piker].tapped).toBe(true);
    expect(game.state.zones.perPlayer[B].library.length).toBe(before - 2);
    expect(graveyard(game, B).length).toBe(2);
    expect(graveyard(game, A)).toEqual([]);
  });

  it("Nurgle's Conscription: exiles the graveyard of the card's owner, which is now theirs alone", () => {
    const { game } = table({ players: 3 });
    const piker = toGraveyard(game, "Goblin Piker", B);
    const rest = toGraveyard(game, "Shock", B);
    const another = toGraveyard(game, "Shock", C);
    const mine = toGraveyard(game, "Shock", A);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Nurgle's Conscription"), { targets: [ref(piker)] });
    expect(controller(game, piker)).toBe(A);
    expect(game.state.objects[piker].tapped).toBe(true);
    expect(zone(game, rest)).toBe("exile");
    expect(zone(game, another)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });
});

describe("Enslave: enchanted creature deals 1 damage to its owner", () => {
  it("under your control, the creature deals it to the player who owns it, at your upkeep only", () => {
    const { game } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Enslave"), { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    nextTurn(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(20);
    nextTurn(game, "upkeep");
    settle(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
    expect(life(game, C)).toBe(20);
  });

  it("the creature deals it: its lifelink is its controller's", () => {
    const { game } = table();
    const lifelinker = spawn(game, "Vampire Nighthawk", B);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Enslave"), { targets: [ref(lifelinker)] });
    nextTurn(game, "upkeep");
    settle(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });

  it("the creature's own owner, when the Aura's on something the Aura's controller owns: themselves", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", A);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Enslave"), { targets: [ref(giant)] });
    nextTurn(game, "upkeep");
    settle(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
  });
});

describe("the \"trigger-owner\" scope", () => {
  it("Warped Devotion: the owner discards, not the controller who bounced it or last had it", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Warped Devotion", A);
    const bears = spawn(game, "Grizzly Bears", B);
    takeControl(game, bears, C);
    const held = hand(game, B).length;
    const theirs = hand(game, C).length;
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(bears)] });
    // Back to their hand, and one card out of it.
    expect(hand(game, B).length).toBe(held);
    expect(graveyard(game, B).length).toBe(1);
    expect(hand(game, C).length).toBe(theirs);
    expect(graveyard(game, A).length).toBe(1);
  });

  it("Warped Devotion: triggers on itself being returned (its ruling)", () => {
    const { game } = table();
    const devotion = spawn(game, "Warped Devotion", B);
    const held = hand(game, B).length;
    lands(game, "Island", 2);
    cast(game, toHand(game, "Boomerang"), { targets: [ref(devotion)] });
    expect(hand(game, B).length).toBe(held);
    expect(graveyard(game, B).length).toBe(1);
  });

  it("Warped Devotion: not for what leaves any other way", () => {
    const { game } = table();
    spawn(game, "Warped Devotion", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const held = hand(game, B).length;
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [ref(bears)] });
    expect(hand(game, B).length).toBe(held);
    expect(graveyard(game, B)).toEqual([bears]);
  });

  it("Liability: the owner of a nontoken permanent loses 1, not its controller", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Liability", A);
    const bears = spawn(game, "Grizzly Bears", B);
    takeControl(game, bears, C);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [ref(bears)] });
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(20);
    expect(life(game, A)).toBe(20);
  });

  it("Liability: nothing for a token, or a permanent gone elsewhere", () => {
    const { game } = table();
    spawn(game, "Liability", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Boomerang"), { targets: [ref(bears)] });
    expect(life(game, B)).toBe(20);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Raise the Alarm"));
    const [soldier] = named(game, "Soldier Token", A);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [ref(soldier)] });
    expect(life(game, A)).toBe(20);
  });
});

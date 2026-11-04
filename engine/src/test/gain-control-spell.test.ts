/**
 * "Gain control of target spell" (Commandeer, Aethersnatch — rule 112.2): the
 * spell's "you" is its new controller, its targets are judged from their side,
 * and the permanent it becomes is theirs with the caster its default controller
 * (rule 110.2b). Who cast it stays who cast it (`spellCaster`), whatever reads
 * that: a spell countered, "if you cast it", rebound's "your hand".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  cast,
  controller,
  graveyard,
  hand,
  lands,
  life,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const steal = (game: Game, by: PlayerId, spell: ObjectId): void =>
  game.debugApplyEffect(by, { kind: "gain-control-spell", target: 0 }, [ref(spell)]);

/** Alice has cast `name`, and it's on the stack with her holding priority. */
function aliceCasts(game: Game, name: string, land: string, n: number, targets?: readonly (ObjectId | PlayerId)[]): ObjectId {
  lands(game, land, n);
  const spell = toHand(game, name);
  cast(game, spell, { settle: false, targets: (targets ?? []).map(ref) });
  return spell;
}

const passTo = (game: Game, player: PlayerId): void => {
  game.dispatch({ type: "pass-priority", player });
};

describe("Commandeer", () => {
  it("costs exiling two blue cards from hand, and takes the spell: its controller's draw is the thief's, its card its owner's", () => {
    const { game } = table();
    const spell = aliceCasts(game, "Divination", "Island", 3);
    passTo(game, A);
    const commandeer = toHand(game, "Commandeer", B);
    const paid = [toHand(game, "Opt", B), toHand(game, "Divination", B)];
    const before = { a: hand(game, A).length, b: hand(game, B).length };
    cast(game, commandeer, { player: B, targets: [ref(spell)], altCost: true });
    for (const card of paid) expect(zone(game, card)).toBe("exile");
    expect(hand(game, A).length).toBe(before.a);
    // Commandeer and the two exiled cards went, and two were drawn.
    expect(hand(game, B).length).toBe(before.b - 3 + 2);
    expect(graveyard(game, A)).toContain(spell);
    expect(graveyard(game, B)).not.toContain(spell);
  });

  it("can't take a creature spell, and Aethersnatch can", () => {
    const { game } = table();
    const bears = aliceCasts(game, "Grizzly Bears", "Forest", 2);
    passTo(game, A);
    lands(game, "Island", 7, B);
    const commandeer = toHand(game, "Commandeer", B);
    expect(() => cast(game, commandeer, { player: B, targets: [ref(bears)], settle: false })).toThrow();
    const snatch = toHand(game, "Aethersnatch", B);
    cast(game, snatch, { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
    expect(game.state.objects[bears].owner).toBe(A);
    // It was Alice who cast it (the `castBy` clause: Rocco's "if you cast it").
    expect(game.state.objects[bears].entry?.cast?.by).toBe(A);
  });

  it("offers new targets, the thief choosing, from the thief's side", () => {
    const { game, b } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    const flicker = aliceCasts(game, "Ephemerate", "Plains", 1, [mine]);
    passTo(game, A);
    let offered: readonly (readonly unknown[])[] = [];
    let chooser = false;
    b.chooseTargetsFn = (_view, _source, _specs, options) => {
      chooser = true;
      offered = options;
      return [ref(theirs)];
    };
    lands(game, "Island", 7, B);
    cast(game, toHand(game, "Commandeer", B), { player: B, targets: [ref(flicker)] });
    expect(chooser).toBe(true);
    // "Target creature you control", now that "you" is Bob: his, and hers as
    // it stands, which may be left though it's illegal (rule 115.7d).
    expect(offered[0]).toContainEqual(ref(theirs));
    expect(offered[0]).toContainEqual(ref(mine));
    expect(game.state.objects[theirs].zoneChangeCount ?? 0).toBeGreaterThan(0);
    expect(graveyard(game, A)).toContain(flicker);
  });

  it("left on a target now illegal from the thief's side, the spell does nothing (rule 608.2b)", () => {
    const { game, b } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const flicker = aliceCasts(game, "Ephemerate", "Plains", 1, [mine]);
    const stint = game.state.objects[mine].zoneChangeCount ?? 0;
    passTo(game, A);
    b.chooseTargetsFn = () => [ref(mine)];
    lands(game, "Island", 7, B);
    cast(game, toHand(game, "Commandeer", B), { player: B, targets: [ref(flicker)] });
    expect(game.state.objects[mine].zoneChangeCount ?? 0).toBe(stint);
    expect(graveyard(game, A)).toContain(flicker);
  });

  it("the targets of a spell with none aren't asked about", () => {
    const { game, b } = table();
    const spell = aliceCasts(game, "Divination", "Island", 3);
    passTo(game, A);
    let asked = false;
    b.chooseTargetsFn = () => {
      asked = true;
      return [];
    };
    lands(game, "Island", 7, B);
    cast(game, toHand(game, "Commandeer", B), { player: B, targets: [ref(spell)] });
    expect(asked).toBe(false);
  });
});

describe("who cast it, whoever controls it now", () => {
  it("a spell you cast being countered is the caster's, not the thief's (Multani's Presence)", () => {
    const { game } = table();
    spawn(game, "Multani's Presence", A);
    spawn(game, "Multani's Presence", B);
    const spell = aliceCasts(game, "Grizzly Bears", "Forest", 2);
    steal(game, B, spell);
    const before = { a: hand(game, A).length, b: hand(game, B).length };
    game.debugApplyEffect(A, { kind: "counter", target: 0 }, [ref(spell)]);
    settle(game);
    expect(hand(game, A).length).toBe(before.a + 1);
    expect(hand(game, B).length).toBe(before.b);
  });

  it("rebound is for a spell cast from your hand: a stolen one goes to its owner's graveyard", () => {
    const { game, b } = table();
    const spell = aliceCasts(game, "Staggershock", "Mountain", 3, [B]);
    steal(game, B, spell);
    b.chooseTargetsFn = () => [ref(A)];
    settle(game);
    expect(zone(game, spell)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(spell);
  });

  it("rebound still works for a spell its caster has taken back", () => {
    const { game } = table();
    const spell = aliceCasts(game, "Staggershock", "Mountain", 3, [B]);
    steal(game, B, spell);
    steal(game, A, spell);
    settle(game);
    expect(zone(game, spell)).toBe("exile");
    expect(life(game, B)).toBe(18);
  });

  it("buyback returns a stolen spell to its owner's hand, and the thief draws", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const spell = toHand(game, "Whispers of the Muse");
    cast(game, spell, { settle: false, kicked: true });
    steal(game, B, spell);
    const before = hand(game, B).length;
    settle(game);
    expect(hand(game, A)).toContain(spell);
    expect(hand(game, B).length).toBe(before + 1);
  });
});

describe("the permanent a stolen spell becomes (rule 110.2b)", () => {
  it("is the thief's, an artifact spell's too, through a later check of layer 2", () => {
    const { game } = table();
    const ring = aliceCasts(game, "Sol Ring", "Wastes", 1);
    steal(game, B, ring);
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
    expect(controller(game, ring)).toBe(B);
    expect(game.state.objects[ring].owner).toBe(A);
    spawn(game, "Grizzly Bears");
    settle(game);
    expect(controller(game, ring)).toBe(B);
  });

  it("goes back to the player who cast it when the thief leaves the game (800.4a), not exiled", () => {
    const { game } = table({ players: 3 });
    const ring = aliceCasts(game, "Sol Ring", "Wastes", 1);
    steal(game, B, ring);
    settle(game);
    game.concede(B);
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
    expect(controller(game, ring)).toBe(A);
  });

  it("stays with the thief when its caster, not its owner, leaves; exiled once the thief leaves too (800.4c)", () => {
    const { game } = table({ players: 4 });
    const ring = toGraveyard(game, "Sol Ring", C);
    game.debugApplyEffect(A, {
      kind: "player-effect",
      duration: "end-of-turn",
      castFromGraveyard: { filter: { type: "artifact" }, whose: "each-player" },
    });
    lands(game, "Wastes", 1);
    cast(game, ring, { via: "graveyard-permission", settle: false });
    steal(game, B, ring);
    settle(game);
    expect(controller(game, ring)).toBe(B);
    expect(game.state.objects[ring].owner).toBe(C);
    game.concede(A);
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
    expect(controller(game, ring)).toBe(B);
    game.concede(B);
    settle(game);
    expect(zone(game, ring)).toBe("exile");
    expect(game.state.players[D].hasLost).toBe(false);
  });
});

describe("a stolen spell's controller leaving the game with it on the stack", () => {
  it("goes back to the player who cast it (800.4a)", () => {
    const { game } = table({ players: 3 });
    const spell = aliceCasts(game, "Divination", "Island", 3);
    steal(game, B, spell);
    game.concede(B);
    expect(zone(game, spell)).toBe("stack");
    expect(controller(game, spell)).toBe(A);
    const before = hand(game, A).length;
    settle(game);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("goes back to the last thief still in the game, one after another", () => {
    const { game } = table({ players: 4 });
    const spell = aliceCasts(game, "Divination", "Island", 3);
    steal(game, B, spell);
    steal(game, C, spell);
    game.concede(C);
    expect(controller(game, spell)).toBe(B);
    game.concede(B);
    expect(controller(game, spell)).toBe(A);
  });

  it("is exiled once there's nobody to go back to (800.4c)", () => {
    const { game } = table({ players: 4 });
    const card = toGraveyard(game, "Divination", C);
    game.debugApplyEffect(A, {
      kind: "player-effect",
      duration: "end-of-turn",
      castFromGraveyard: { filter: { type: "sorcery" }, whose: "each-player" },
    });
    lands(game, "Island", 3);
    cast(game, card, { via: "graveyard-permission", settle: false });
    steal(game, B, card);
    game.concede(A);
    expect(zone(game, card)).toBe("stack");
    expect(controller(game, card)).toBe(B);
    game.concede(B);
    expect(zone(game, card)).toBe("exile");
  });

  it("the spell leaves with its owner, as ever", () => {
    const { game } = table({ players: 3 });
    const spell = aliceCasts(game, "Divination", "Island", 3);
    steal(game, B, spell);
    passTo(game, A);
    game.concede(A);
    expect(zone(game, spell)).not.toBe("stack");
  });
});

describe("a copy of a spell", () => {
  it("can be stolen, its controller's draw the thief's, and is gone with the player who made it", () => {
    const { game } = table({ players: 3 });
    const spell = aliceCasts(game, "Divination", "Island", 3);
    game.debugApplyEffect(A, { kind: "copy-spell", target: 0 }, [ref(spell)]);
    const stack = game.state.zones.shared.stack;
    const copy = stack[stack.length - 1];
    expect(copy).not.toBe(spell);
    steal(game, B, copy);
    const before = hand(game, B).length;
    game.advanceUntil((s) => !s.zones.shared.stack.includes(copy));
    expect(hand(game, B).length).toBe(before + 2);
    settle(game);
  });
});

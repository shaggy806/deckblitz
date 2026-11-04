/**
 * "Gain control of target spell" (Commandeer, Aethersnatch — rule 112.2): the
 * spell's "you" is its new controller, its targets are judged from their side,
 * and the permanent it becomes is theirs with the caster its default controller
 * (rule 110.2b). Who cast it stays who cast it (`spellCaster`), whatever reads
 * that: a spell countered, "if you cast it", rebound's "your hand".
 */
import { describe, expect, it } from "vitest";

import { spellCantBeCountered, spellHasSplitSecond } from "../characteristics.js";
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

describe("a stolen spell's slots bound to a player by seat", () => {
  /** Alice's Tempted by the Oriq on the stack, aimed at `aimed` by name of seat,
   * at a table of `players` with a Grizzly Bears each. */
  function tempted(players: 2 | 3 | 4, aimed: (bears: Record<string, ObjectId>) => readonly (ObjectId | null)[]) {
    const t = table({ players });
    const { game } = t;
    const bears: Record<string, ObjectId> = {};
    for (const player of t.players) bears[player] = spawn(game, "Grizzly Bears", player);
    lands(game, "Island", 4);
    const spell = toHand(game, "Tempted by the Oriq");
    cast(game, spell, { settle: false, targets: aimed(bears).map((id) => (id === null ? null : ref(id))) });
    return { ...t, bears, spell };
  }

  it("keeps each target with its player: the thief's opponents' creatures stay legal, the thief's own doesn't (4 players)", () => {
    const { game, bears, spell } = tempted(4, (b) => [b[B], b[C], b[D]]);
    steal(game, B, spell);
    settle(game);
    expect(controller(game, bears[C])).toBe(B);
    expect(controller(game, bears[D])).toBe(B);
    expect(controller(game, bears[B])).toBe(B);
    expect(controller(game, bears[A])).toBe(A);
    // Nothing in it was a control effect on Bob's own creature: illegal, skipped.
    expect(game.state.objects[bears[B]].controlEffects).toBeUndefined();
  });

  it("does so from any seat: the thief across the table", () => {
    const { game, bears, spell } = tempted(4, (b) => [b[B], b[C], b[D]]);
    steal(game, C, spell);
    settle(game);
    expect(controller(game, bears[B])).toBe(C);
    expect(controller(game, bears[D])).toBe(C);
    expect(game.state.objects[bears[C]].controlEffects).toBeUndefined();
  });

  it("and back again: stolen and taken back, it does what its caster aimed it to", () => {
    const { game, bears, spell } = tempted(4, (b) => [b[B], b[C], b[D]]);
    steal(game, B, spell);
    steal(game, C, spell);
    steal(game, A, spell);
    settle(game);
    expect(controller(game, bears[B])).toBe(A);
    expect(controller(game, bears[C])).toBe(A);
    expect(controller(game, bears[D])).toBe(A);
  });

  it("with Commandeer, the slot that was the thief's own is the old controller's now", () => {
    const { game, b, bears, spell } = tempted(4, (x) => [x[B], x[C], x[D]]);
    passTo(game, A);
    let offered: readonly (readonly unknown[])[] = [];
    b.chooseTargetsFn = (_view, _source, _specs, options) => {
      offered = options;
      // Bob's own Bears is in the slot now bound to Alice: aim it at hers.
      return options.map((slot) => (slot[0] as { object?: ObjectId }).object === bears[B] ? ref(bears[A]) : (slot[0] as ReturnType<typeof ref>));
    };
    lands(game, "Island", 7, B);
    cast(game, toHand(game, "Commandeer", B), { player: B, targets: [ref(spell)] });
    // The three slots, in Bob's seats: Carol's, Dave's, Alice's.
    expect(offered[0]).toEqual([ref(bears[C])]);
    expect(offered[1]).toEqual([ref(bears[D])]);
    expect(offered[2]).toEqual([ref(bears[B]), ref(bears[A])]);
    expect(controller(game, bears[A])).toBe(B);
    expect(controller(game, bears[C])).toBe(B);
    expect(controller(game, bears[D])).toBe(B);
  });

  it("leaves a slot its caster left empty empty, however it turns (rule 115.7: the number of targets stays)", () => {
    const { game, bears, spell } = tempted(4, (b) => [null, b[C], null]);
    steal(game, B, spell);
    settle(game);
    expect(controller(game, bears[C])).toBe(B);
    expect(controller(game, bears[D])).toBe(D);
    expect(controller(game, bears[A])).toBe(A);
  });

  it("at 3 players", () => {
    const { game, bears, spell } = tempted(3, (b) => [b[B], b[C], null]);
    steal(game, B, spell);
    settle(game);
    expect(controller(game, bears[C])).toBe(B);
    expect(controller(game, bears[A])).toBe(A);
  });

  it("at 2 players: the only target is the thief's own, illegal, until it's changed to the caster's", () => {
    const first = tempted(2, (b) => [b[B], null, null]);
    steal(first.game, B, first.spell);
    settle(first.game);
    expect(first.game.state.objects[first.bears[B]].controlEffects).toBeUndefined();
    expect(controller(first.game, first.bears[A])).toBe(A);

    const { game, b, bears, spell } = tempted(2, (x) => [x[B], null, null]);
    passTo(game, A);
    b.chooseTargetsFn = () => [ref(bears[A])];
    lands(game, "Island", 7, B);
    cast(game, toHand(game, "Commandeer", B), { player: B, targets: [ref(spell)] });
    expect(controller(game, bears[A])).toBe(B);
  });

  it("slots for every player, the thief's seat among them: Afterlife from the Loam, each card still legal", () => {
    const { game } = table({ players: 4 });
    const cards = [A, B, C, D].map((player) => toGraveyard(game, "Grizzly Bears", player));
    lands(game, "Swamp", 8);
    const spell = toHand(game, "Afterlife from the Loam");
    cast(game, spell, { settle: false, targets: cards.map(ref) });
    steal(game, B, spell);
    settle(game);
    for (const card of cards) {
      expect(zone(game, card)).toBe("battlefield");
      expect(controller(game, card)).toBe(B);
    }
  });
});

describe("a copy made by another player of a spell with slots bound by seat", () => {
  it("keeps each target with its player, from the copier's seats (rule 707.10)", () => {
    const t = table({ players: 4 });
    const { game } = t;
    const bears = Object.fromEntries(t.players.map((player) => [player, spawn(game, "Grizzly Bears", player)]));
    lands(game, "Island", 4);
    const spell = toHand(game, "Tempted by the Oriq");
    cast(game, spell, { settle: false, targets: [ref(bears[B]), ref(bears[C]), ref(bears[D])] });
    game.debugApplyEffect(C, { kind: "copy-spell", target: 0 }, [ref(spell)]);
    const stack = game.state.zones.shared.stack;
    const copy = stack[stack.length - 1];
    expect(copy).not.toBe(spell);
    game.advanceUntil((s) => !s.zones.shared.stack.includes(copy));
    // Carol's copy takes Bob's and Dave's; her own Bears was never hers to take.
    expect(controller(game, bears[B])).toBe(C);
    expect(controller(game, bears[D])).toBe(C);
    settle(game);
  });
});

describe("grants by their wording (rule 109.5: \"you\" on a static is its permanent's controller)", () => {
  const counterable = (game: Game, spell: ObjectId): boolean =>
    !spellCantBeCountered(game.state, game.registry, game.state.objects[spell]);

  describe("\"spells you cast\" ask who cast it", () => {
    it("Cunning Nightbonder's stays on the spell its controller cast, and doesn't reach what they steal", () => {
      const mine = table();
      spawn(mine.game, "Cunning Nightbonder", A);
      const stolen = aliceCasts(mine.game, "Ambush Viper", "Forest", 2);
      expect(counterable(mine.game, stolen)).toBe(false);
      steal(mine.game, B, stolen);
      expect(counterable(mine.game, stolen)).toBe(false);

      const theirs = table();
      spawn(theirs.game, "Cunning Nightbonder", B);
      const taken = aliceCasts(theirs.game, "Ambush Viper", "Forest", 2);
      steal(theirs.game, B, taken);
      expect(counterable(theirs.game, taken)).toBe(true);
    });

    it("Shadow the Hedgehog's split second stays on the spell its controller cast, and not its copy", () => {
      const { game } = table({ players: 3 });
      spawn(game, "Shadow the Hedgehog", A);
      spawn(game, "Sol Ring", A);
      lands(game, "Island", 1);
      const spell = toHand(game, "Divination");
      cast(game, spell, { settle: false });
      expect(spellHasSplitSecond(game.state, game.registry, game.state.objects[spell])).toBe(true);
      game.debugApplyEffect(A, { kind: "copy-spell", target: 0 }, [ref(spell)]);
      const stack = game.state.zones.shared.stack;
      expect(spellHasSplitSecond(game.state, game.registry, game.state.objects[stack[stack.length - 1]])).toBe(false);
      steal(game, B, spell);
      expect(spellHasSplitSecond(game.state, game.registry, game.state.objects[spell])).toBe(true);
    });

    it("Overmaster's next spell you cast stays uncounterable, stolen", () => {
      const { game } = table();
      lands(game, "Mountain", 1);
      cast(game, toHand(game, "Overmaster"));
      const spell = aliceCasts(game, "Divination", "Island", 3);
      expect(counterable(game, spell)).toBe(false);
      steal(game, B, spell);
      expect(counterable(game, spell)).toBe(false);
    });
  });

  describe("\"spells you control\" ask who controls it now", () => {
    it("Chimil, the Inner Sun's follows the spell to the thief", () => {
      const mine = table();
      spawn(mine.game, "Chimil, the Inner Sun", A);
      const leaving = aliceCasts(mine.game, "Divination", "Island", 3);
      expect(counterable(mine.game, leaving)).toBe(false);
      steal(mine.game, B, leaving);
      expect(counterable(mine.game, leaving)).toBe(true);

      const theirs = table();
      spawn(theirs.game, "Chimil, the Inner Sun", B);
      const arriving = aliceCasts(theirs.game, "Divination", "Island", 3);
      expect(counterable(theirs.game, arriving)).toBe(true);
      steal(theirs.game, B, arriving);
      expect(counterable(theirs.game, arriving)).toBe(false);
    });

    it("Veil of Summer's, for the turn, likewise", () => {
      const mine = table();
      mine.game.debugApplyEffect(A, { kind: "grant-spells-this-turn", cantBeCountered: true });
      const leaving = aliceCasts(mine.game, "Divination", "Island", 3);
      expect(counterable(mine.game, leaving)).toBe(false);
      steal(mine.game, B, leaving);
      expect(counterable(mine.game, leaving)).toBe(true);

      const theirs = table();
      theirs.game.debugApplyEffect(B, { kind: "grant-spells-this-turn", cantBeCountered: true });
      const arriving = aliceCasts(theirs.game, "Divination", "Island", 3);
      expect(counterable(theirs.game, arriving)).toBe(true);
      steal(theirs.game, B, arriving);
      expect(counterable(theirs.game, arriving)).toBe(false);
    });
  });
});

describe("a stolen copy of a permanent spell (rule 608.3f)", () => {
  /** Alice's Sol Ring and her copy of it on the stack; the copy goes to Bob. */
  function stolenCopy(players: 3 | 4) {
    const t = table({ players });
    const { game } = t;
    const ring = aliceCasts(game, "Sol Ring", "Wastes", 1);
    game.debugApplyEffect(A, { kind: "copy-spell", target: 0 }, [ref(ring)]);
    const stack = game.state.zones.shared.stack;
    const copy = stack[stack.length - 1];
    expect(copy).not.toBe(ring);
    steal(game, B, copy);
    game.advanceUntil((s) => !s.zones.shared.stack.includes(copy));
    return { ...t, ring, copy };
  }

  it("becomes a token under the thief's control, the caster's by default, and stays the thief's", () => {
    const { game, copy } = stolenCopy(3);
    expect(zone(game, copy)).toBe("battlefield");
    expect(game.state.objects[copy].isToken).toBe(true);
    expect(game.state.objects[copy].isCopy).not.toBe(true);
    expect(controller(game, copy)).toBe(B);
    expect(game.state.objects[copy].owner).toBe(A);
    settle(game);
    expect(controller(game, copy)).toBe(B);
  });

  it("goes back to the caster when the thief leaves the game (800.4a)", () => {
    const { game, copy } = stolenCopy(3);
    settle(game);
    game.concede(B);
    settle(game);
    expect(zone(game, copy)).toBe("battlefield");
    expect(controller(game, copy)).toBe(A);
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

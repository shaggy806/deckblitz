/**
 * Abilities about a change of control (rule 603.10d): "when you lose control of
 * this" and "when you gain control of this from another player" on a permanent,
 * "whenever an opponent gains control of a permanent from you", and the delayed
 * "when you lose control of it".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  destroy,
  graveyard,
  hand,
  lands,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;
const attachedTo = (game: Game, id: ObjectId): ObjectId | null | undefined => game.state.objects[id].attachedTo;
/** `to` gains control of `id`, as an effect would give it. */
const give = (game: Game, to: typeof A, id: ObjectId, untilEndOfTurn = false): void => {
  game.debugApplyEffect(to, { kind: "gain-control", target: 0, untilEndOfTurn }, [ref(id)]);
};

describe("delayed: when you lose control of it (Ray of Command)", () => {
  const steal = (players: 2 | 3 = 3) => {
    const t = table({ players });
    lands(t.game, "Island", 4);
    const bears = spawn(t.game, "Grizzly Bears", players === 3 ? C : B, { tapped: true });
    cast(t.game, toHand(t.game, "Ray of Command"), { targets: [ref(bears)] });
    return { ...t, bears };
  };

  it("untaps it, takes it, and taps it as the control ends in the cleanup step", () => {
    const { game, bears } = steal();
    expect(controller(game, bears)).toBe(A);
    expect(tapped(game, bears)).toBe(false);
    // The trigger goes on the stack in cleanup (rule 514.3a; Ray's ruling).
    game.advanceUntil((s) => s.turn.step === "cleanup" && s.zones.shared.stack.length > 0);
    expect(controller(game, bears)).toBe(C);
    expect(tapped(game, bears)).toBe(false);
    nextTurn(game);
    // Bob's turn: Carol's Bears are tapped, and stay so until her untap step.
    expect(tapped(game, bears)).toBe(true);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("fires for any reason, for good: another player gaining control of it", () => {
    const { game, bears } = steal();
    give(game, B, bears);
    settle(game);
    expect(controller(game, bears)).toBe(B);
    expect(tapped(game, bears)).toBe(true);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("does nothing to a permanent that left, and is used up by the leaving", () => {
    const { game, bears } = steal();
    destroy(game, bears);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("isn't about a change that isn't yours to lose", () => {
    const { game, bears } = steal();
    // Alice keeps it: a second effect giving it to her changes no hands.
    give(game, A, bears);
    settle(game);
    expect(game.state.delayedTriggers).toHaveLength(1);
    expect(tapped(game, bears)).toBe(false);
  });
});

describe("Magus of the Unseen", () => {
  it("takes an artifact, which taps as it goes back", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 2);
    const magus = spawn(game, "Magus of the Unseen");
    const rock = spawn(game, "Mind Stone", C, { tapped: true });
    activate(game, magus, 0, { targets: [ref(rock)] });
    settle(game);
    expect(controller(game, rock)).toBe(A);
    expect(tapped(game, rock)).toBe(false);
    nextTurn(game);
    expect(controller(game, rock)).toBe(C);
    expect(tapped(game, rock)).toBe(true);
  });
});

describe("Ogre Geargrabber", () => {
  it("takes Equipment as it attacks, wears it, and it comes off as control ends", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Ogre Geargrabber");
    const sword = spawn(game, "Short Sword", B);
    const bearer = spawn(game, "Grizzly Bears", B);
    game.state.objects[sword].attachedTo = bearer;
    a.chooseTargetsFn = () => [ref(sword)];
    attack(game, a, [ogre]);
    expect(controller(game, sword)).toBe(A);
    expect(attachedTo(game, sword)).toBe(ogre);
    nextTurn(game);
    expect(controller(game, sword)).toBe(B);
    expect(attachedTo(game, sword) ?? null).toBe(null);
  });
});

describe("Stolen Uniform", () => {
  const dress = () => {
    const t = table();
    lands(t.game, "Island", 1);
    const mine = spawn(t.game, "Grizzly Bears");
    const sword = spawn(t.game, "Short Sword", B);
    cast(t.game, toHand(t.game, "Stolen Uniform"), { targets: [ref(mine), ref(sword)] });
    return { ...t, mine, sword };
  };

  it("unattaches as the until-end-of-turn ends, the 'this turn' lasting through cleanup", () => {
    const { game, mine, sword } = dress();
    expect(attachedTo(game, sword)).toBe(mine);
    nextTurn(game);
    expect(controller(game, sword)).toBe(B);
    expect(attachedTo(game, sword) ?? null).toBe(null);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("doesn't trigger when it isn't attached to a creature you control (rule 603.4)", () => {
    const { game, sword } = dress();
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[sword].attachedTo = theirs;
    give(game, B, sword);
    expect(game.state.pendingTriggers).toHaveLength(0);
    expect(game.state.zones.shared.stack).toHaveLength(0);
    settle(game);
    expect(attachedTo(game, sword)).toBe(theirs);
  });

  it("has a stated duration: lost, regained and lost again, it triggers again (rule 603.7b)", () => {
    const { game, mine, sword } = dress();
    give(game, B, sword);
    settle(game);
    expect(attachedTo(game, sword) ?? null).toBe(null);
    give(game, A, sword);
    game.state.objects[sword].attachedTo = mine;
    give(game, B, sword);
    settle(game);
    expect(attachedTo(game, sword) ?? null).toBe(null);
  });
});

describe("Seraph", () => {
  /** Alice's Seraph has killed Bob's Bears; it's the end step's return next. */
  const killed = () => {
    const t = table();
    const seraph = spawn(t.game, "Seraph");
    const bears = spawn(t.game, "Grizzly Bears", B);
    t.game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 2 }, [ref(bears)], { source: seraph });
    t.game.advanceUntil((st) => st.objects[bears].zone === "graveyard");
    settle(t.game);
    return { ...t, seraph, bears };
  };

  it("returns the creature at the next end step, sacrificed when you lose control of Seraph", () => {
    const { game, seraph } = killed();
    toStep(game, "end");
    settle(game);
    const [back] = named(game, "Grizzly Bears", A);
    expect(back).toBeDefined();
    expect(controller(game, back)).toBe(A);
    give(game, B, seraph);
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(zone(game, back)).toBe("graveyard");
  });

  it("Seraph leaving after the return is losing control of it (Khârn's ruling): sacrificed", () => {
    const { game, seraph } = killed();
    toStep(game, "end");
    settle(game);
    const [back] = named(game, "Grizzly Bears", A);
    destroy(game, seraph);
    settle(game);
    expect(zone(game, back)).toBe("graveyard");
  });

  it("never asks for the sacrifice once Seraph has left before the return (the ruling)", () => {
    const { game, seraph } = killed();
    destroy(game, seraph);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("under another player at the return: only regaining and losing it again counts (the ruling)", () => {
    const { game, seraph } = killed();
    give(game, B, seraph);
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    // Bob losing it to Alice isn't Alice losing it.
    give(game, A, seraph);
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    give(game, B, seraph);
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
  });
});

describe("Zidane, Tantalus Thief", () => {
  it("makes a Treasure when an opponent gains control of a permanent from you", () => {
    const { game } = table();
    spawn(game, "Zidane, Tantalus Thief");
    const rock = spawn(game, "Mind Stone");
    give(game, B, rock);
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("not for what you take, nor for a permanent going between other players", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Zidane, Tantalus Thief");
    const rock = spawn(game, "Mind Stone", B);
    give(game, A, rock);
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    const other = spawn(game, "Mind Stone", B);
    give(game, C, other);
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("sees itself go, the Treasure its former controller's (rule 603.10d)", () => {
    const { game } = table();
    const zidane = spawn(game, "Zidane, Tantalus Thief");
    give(game, B, zidane);
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
  });

  it("taken with other permanents at once: one for each, itself included (the ruling)", () => {
    const { game } = table();
    // Zidane first on the board, so it's first through the mass change.
    const zidane = spawn(game, "Zidane, Tantalus Thief");
    spawn(game, "Mind Stone");
    spawn(game, "Mind Stone");
    game.debugApplyEffect(
      B,
      { kind: "gain-control-all", filter: { controlledBy: "opponent" }, untilEndOfTurn: false },
      [],
    );
    settle(game);
    expect(controller(game, zidane)).toBe(B);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
  });

  it("each token of a stack handed over whole is a permanent", () => {
    const { game } = table();
    spawn(game, "Zidane, Tantalus Thief");
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 4 }, []);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(4);
    game.debugApplyEffect(
      B,
      { kind: "gain-control-all", filter: { subtype: "Treasure", controlledBy: "opponent" }, untilEndOfTurn: false },
      [],
    );
    settle(game);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(4);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(4);
  });

  it("a creature it stole going back at end of turn is an opponent gaining control from you", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bears)];
    game.debugSpawn("Zidane, Tantalus Thief", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(controller(game, bears)).toBe(A);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Risky Move", () => {
  it("changes hands each upkeep; the new controller chooses, flips, and may lose the creature", () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game, b } = table({ seed });
      const move = spawn(game, "Risky Move");
      const bears = spawn(game, "Grizzly Bears", B);
      pickPermanents(b, bears);
      nextTurn(game);
      expect(controller(game, move)).toBe(B);
      const [flip] = game.eventsOfType("coin-flipped");
      expect(flip).toBeDefined();
      expect(flip.player).toBe(B);
      expect(controller(game, bears)).toBe(flip.won ? B : A);
    }
  });

  it("with no creature to choose, the coin is still flipped", () => {
    const { game } = table();
    spawn(game, "Risky Move");
    nextTurn(game);
    expect(game.eventsOfType("coin-flipped")).toHaveLength(1);
  });

  it("entering under your control, or keeping it at your own upkeep, is no gain", () => {
    const { game } = table();
    const move = game.debugSpawn("Risky Move", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(game.eventsOfType("coin-flipped")).toHaveLength(0);
    expect(controller(game, move)).toBe(A);
  });

  it("asks which opponent among several, and hands the creature to the one chosen", () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game, b } = table({ players: 3, seed });
      spawn(game, "Risky Move");
      const bears = spawn(game, "Grizzly Bears", B);
      // Bob's opponents, from his left: Carol, then Alice.
      pickModes(b, 0);
      pickPermanents(b, bears);
      nextTurn(game);
      const [flip] = game.eventsOfType("coin-flipped");
      expect(controller(game, bears)).toBe(flip.won ? B : C);
    }
  });
});

describe("Khârn the Betrayer", () => {
  it("damage is prevented, an opponent gains control of it, and you draw two", () => {
    const { game } = table();
    const kharn = spawn(game, "Khârn the Betrayer");
    const before = hand(game, A).length;
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 3 }, [ref(kharn)]);
    settle(game);
    expect(zone(game, kharn)).toBe("battlefield");
    expect(game.state.objects[kharn].damageMarked).toBe(0);
    expect(controller(game, kharn)).toBe(B);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("leaving the battlefield is losing control of it (the ruling)", () => {
    const { game } = table();
    const kharn = spawn(game, "Khârn the Betrayer");
    const before = hand(game, A).length;
    destroy(game, kharn);
    settle(game);
    expect(graveyard(game, A)).toContain(kharn);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("its controller chooses among several opponents", () => {
    const { game, a } = table({ players: 3 });
    const kharn = spawn(game, "Khârn the Betrayer");
    pickModes(a, 1);
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 3 }, [ref(kharn)]);
    settle(game);
    expect(controller(game, kharn)).toBe(C);
  });

  it("blocked in a four-player combat: the choice comes, then the combat goes on", () => {
    const { game, a, b } = table({ players: 4 });
    const kharn = spawn(game, "Khârn the Betrayer");
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker: kharn }];
    pickModes(a, 1);
    const before = hand(game, A).length;
    attack(game, a, [kharn]);
    expect(controller(game, kharn)).toBe(C);
    expect(hand(game, A).length).toBe(before + 2);
    expect(zone(game, blocker)).toBe("graveyard");
    expect(game.state.turn.step).toBe("postcombat-main");
  });

  it("blocked by a first striker among several opponents: asked, then the rest of combat", () => {
    const { game, a, b } = table({ players: 3 });
    const kharn = spawn(game, "Khârn the Betrayer");
    const blocker = spawn(game, "Youthful Knight", B);
    b.declareBlockersFn = () => [{ blocker, attacker: kharn }];
    pickModes(a, 0);
    attack(game, a, [kharn]);
    expect(controller(game, kharn)).not.toBe(A);
    // Out of combat after the first-strike pass, so it deals no damage.
    expect(zone(game, blocker)).toBe("battlefield");
    expect(game.state.turn.step).toBe("postcombat-main");
  });

  it("two of them dealt damage at once: each controller is asked in turn", () => {
    const { game, a, b } = table({ players: 3 });
    const mine = spawn(game, "Khârn the Betrayer");
    const theirs = spawn(game, "Khârn the Betrayer", B);
    b.declareBlockersFn = () => [{ blocker: theirs, attacker: mine }];
    pickModes(a, 0);
    pickModes(b, 0);
    const [mineBefore, theirsBefore] = [hand(game, A).length, hand(game, B).length];
    attack(game, a, [mine]);
    expect(controller(game, mine)).not.toBe(A);
    expect(controller(game, theirs)).not.toBe(B);
    expect(hand(game, A).length).toBe(mineBefore + 2);
    expect(hand(game, B).length).toBe(theirsBefore + 2);
  });

  it("two of them caught in one sweep: each controller is asked in turn", () => {
    const { game, a, b } = table({ players: 3 });
    const mine = spawn(game, "Khârn the Betrayer");
    const theirs = spawn(game, "Khârn the Betrayer", B);
    pickModes(a, 0);
    pickModes(b, 0);
    game.debugApplyEffect(C, { kind: "damage-all", filter: { type: "creature" }, amount: 1 }, []);
    settle(game);
    expect(controller(game, mine)).not.toBe(A);
    expect(controller(game, theirs)).not.toBe(B);
  });

  it("in the middle of a spell, among several opponents: the rest of the spell follows", () => {
    const { game, a } = table({ players: 3 });
    const kharn = spawn(game, "Khârn the Betrayer");
    pickModes(a, 1);
    game.debugApplyEffect(
      B,
      {
        kind: "sequence",
        effects: [
          { kind: "damage", target: 0, amount: 1 },
          { kind: "gain-life", amount: 5 },
        ],
      },
      [ref(kharn)],
    );
    settle(game);
    expect(controller(game, kharn)).toBe(C);
    expect(game.state.players[B].life).toBe(25);
  });

  it("damage from two sources at once is one change of control", () => {
    const { game, a, b } = table({ players: 3 });
    const kharn = spawn(game, "Khârn the Betrayer");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: one, attacker: kharn },
      { blocker: two, attacker: kharn },
    ];
    pickModes(a, 0);
    const before = hand(game, A).length;
    attack(game, a, [kharn]);
    expect(controller(game, kharn)).toBe(B);
    expect(hand(game, A).length).toBe(before + 2);
  });
});

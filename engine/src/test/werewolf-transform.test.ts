/**
 * The Innistrad werewolves' transforms: "At the beginning of each upkeep, if
 * no spells were cast last turn, transform this creature", and the back
 * face's "if a player cast two or more spells last turn" — one player's two,
 * never two players' one each (the rulings). The `spells-cast-last-turn`
 * condition, read from `GameState.spellsCastLastTurn`. Beside them, damage
 * to a trigger's object ("deals 1 damage to that creature") and the
 * all-hands count, which some of the same werewolves need.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";

import { A, B, cast, enter, lands, nextTurn, pickModes, pt, ref, spawn, table, toHand } from "./harness.js";

const faceOf = (game: Game, id: ObjectId) => printedCardName(game.state.objects[id]);

describe("werewolf transforms", () => {
  it("transforms at the next upkeep after a turn with no spells", () => {
    const { game } = table();
    const logger = spawn(game, "Hinterland Logger");
    expect(faceOf(game, logger)).toBe("Hinterland Logger");
    nextTurn(game);
    expect(faceOf(game, logger)).toBe("Timber Shredder");
    expect(pt(game, logger)).toEqual({ power: 4, toughness: 2 });
  });

  it("doesn't transform after a turn a spell was cast", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const logger = spawn(game, "Hinterland Logger");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    nextTurn(game);
    expect(faceOf(game, logger)).toBe("Hinterland Logger");
  });

  it("transforms back after one player cast two spells in a turn", () => {
    const { game } = table();
    const logger = spawn(game, "Hinterland Logger");
    nextTurn(game);
    expect(faceOf(game, logger)).toBe("Timber Shredder");
    // Bob's turn: he casts two spells.
    lands(game, "Mountain", 2, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    nextTurn(game);
    expect(faceOf(game, logger)).toBe("Hinterland Logger");
  });

  it("doesn't transform back when two players cast one spell each", () => {
    const { game } = table();
    const logger = spawn(game, "Hinterland Logger");
    nextTurn(game);
    expect(faceOf(game, logger)).toBe("Timber Shredder");
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    // And one of alice's in the same turn (as an instant in response would be).
    game.state.players[A].spellsCastThisTurn += 1;
    game.state.spellsCastThisTurn += 1;
    nextTurn(game);
    expect(faceOf(game, logger)).toBe("Timber Shredder");
  });
});

describe("damage to the trigger's object", () => {
  it("Kessig Forgemaster, transformed, deals 2 damage to the creature it blocks", () => {
    const g = table();
    const { game } = g;
    const forgemaster = spawn(game, "Kessig Forgemaster");
    nextTurn(game);
    // Bob's turn: transformed by now? No spells were cast on alice's turn —
    // it's Flameheart Werewolf (2 damage).
    expect(faceOf(game, forgemaster)).toBe("Flameheart Werewolf");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    g.b.declareAttackersFn = () => [{ attacker: dreadmaw, defender: A }];
    g.a.declareBlockersFn = () => [{ blocker: forgemaster, attacker: dreadmaw }];
    game.advanceUntil((s) => s.turn.step === "end-combat");
    // The trigger's 2, then the Werewolf's 3 in combat.
    expect(game.state.objects[dreadmaw].damageMarked).toBe(5);
  });

  it("Ornery Goblin deals 1 damage to the creature that blocks it", () => {
    const g = table();
    const { game } = g;
    const goblin = spawn(game, "Ornery Goblin");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    g.a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    g.b.declareBlockersFn = () => [{ blocker: dreadmaw, attacker: goblin }];
    game.advanceUntil((s) => s.turn.step === "end-combat");
    // The trigger's 1, then the Goblin's 2 in combat.
    expect(game.state.objects[dreadmaw].damageMarked).toBe(3);
  });

  it("Caltrops deals 1 damage to each attacking creature", () => {
    const g = table();
    const { game } = g;
    spawn(game, "Caltrops");
    const bears = spawn(game, "Grizzly Bears");
    g.a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });
});

describe("Werewolf of Ancient Hunger", () => {
  it("is as big as all players' hands together", () => {
    const { game } = table();
    const sage = spawn(game, "Sage of Ancient Lore");
    const mine = game.state.zones.perPlayer[A].hand.length;
    expect(pt(game, sage)).toEqual({ power: mine, toughness: mine });
    nextTurn(game);
    expect(faceOf(game, sage)).toBe("Werewolf of Ancient Hunger");
    const all = game.state.zones.perPlayer[A].hand.length + game.state.zones.perPlayer[B].hand.length;
    expect(pt(game, sage)).toEqual({ power: all, toughness: all });
  });
});

describe("Vildin-Pack Alpha", () => {
  it("may transform a Werewolf entering under your control", () => {
    const { game, a } = table();
    const bandit = spawn(game, "Geier Reach Bandit");
    nextTurn(game);
    nextTurn(game);
    // Alice's next turn: no spells since, so the Bandit is still the Alpha.
    expect(faceOf(game, bandit)).toBe("Vildin-Pack Alpha");
    pickModes(a, 0);
    const logger = enter(game, "Hinterland Logger");
    expect(faceOf(game, logger)).toBe("Timber Shredder");
  });
});

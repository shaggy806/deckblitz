/**
 * A player effect a target player has (`player-effect`'s `to`): Will
 * Kenrith's "−2: Target player draws two cards. Until your next turn,
 * instant, sorcery, and planeswalker spells **that player** casts cost {2}
 * less to cast" — theirs, lasting until Will's controller's next turn (rule
 * 611.2). With Will's other two abilities and his partner Rowan Kenrith's
 * three, each an effect bound to a target player or creature.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import type { GameState } from "../state.js";
import { A, B, activate, hand, keywords, lands, life, loyalty, pt, ref, spawn, table, toHand } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

const castable = (game: Game, card: ObjectId, player: PlayerId): boolean =>
  game.legalActions(player).some((o) => o.kind === "cast-spell" && o.card === card);

/** `player` holds priority in `step` of `turnOf`'s next turn, nothing waiting. */
function toPriority(game: Game, turnOf: PlayerId, step: GameState["turn"]["step"], player: PlayerId): void {
  const from = game.state.turn.number;
  game.advanceUntil(
    (s) =>
      s.turn.number > from &&
      activePlayerOf(s) === turnOf &&
      s.turn.step === step &&
      s.priority.holder === player &&
      s.awaiting === null &&
      s.zones.shared.stack.length === 0,
  );
}

describe("Will Kenrith's −2: target player's spells cost {2} less until your next turn", () => {
  it("is the target player's, not the controller's, and lasts through their turn", () => {
    const { game } = table();
    const will = spawn(game, "Will Kenrith");
    const mine = toHand(game, "Divination");
    lands(game, "Island", 1);
    const theirs = toHand(game, "Divination", B);
    lands(game, "Island", 1, B);
    const before = hand(game, B).length;
    loyalty(game, will, -2, { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before + 2);
    // Alice's own Divination isn't cheaper: one Island doesn't pay {2}{U}.
    expect(castable(game, mine, A)).toBe(false);
    // Bob's turn — "until your next turn" is alice's, so it's still on, and
    // one Island pays his {2}{U} less {2}.
    toPriority(game, B, "precombat-main", B);
    expect(game.state.playerEffects?.[0]?.owner).toBe(B);
    expect(castable(game, theirs, B)).toBe(true);
    // Gone as alice's next turn begins.
    toPriority(game, A, "precombat-main", A);
    expect(game.state.playerEffects ?? []).toEqual([]);
  });

  it("doesn't reduce a spell of a type it doesn't name", () => {
    const { game } = table();
    const will = spawn(game, "Will Kenrith");
    const bears = toHand(game, "Grizzly Bears", B);
    lands(game, "Forest", 1, B);
    loyalty(game, will, -2, { targets: [ref(B)] });
    toPriority(game, B, "precombat-main", B);
    expect(castable(game, bears, B)).toBe(false);
  });
});

describe("Will Kenrith's +2: up to two creatures are 0/3 with no abilities until your next turn", () => {
  it("sets both creatures' base P/T and strips their abilities, then lets go", () => {
    const { game } = table();
    const will = spawn(game, "Will Kenrith");
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, will, 2, { targets: [ref(angel), ref(bears)] });
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 3 });
    expect(keywords(game, angel).has("flying")).toBe(false);
    toPriority(game, B, "precombat-main", B);
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 3 });
    toPriority(game, A, "precombat-main", A);
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, angel).has("flying")).toBe(true);
  });
});

describe("Will Kenrith's −8: target player's emblem copies their instants and sorceries", () => {
  it("copies a sorcery the emblem's owner casts", () => {
    const { game } = table();
    const will = spawn(game, "Will Kenrith");
    loyalty(game, will, -8, { targets: [ref(A)], atLeast: 8 });
    lands(game, "Island", 3);
    const divination = toHand(game, "Divination");
    const before = hand(game).length;
    game.dispatch({ type: "cast-spell", player: A, card: divination, targets: [] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    // Divination and its copy: four cards, less the Divination itself.
    expect(hand(game).length).toBe(before - 1 + 4);
  });
});

describe("Rowan Kenrith", () => {
  it("+2: during target player's next turn, each creature they control attacks if able", () => {
    const { game } = table();
    const rowan = spawn(game, "Rowan Kenrith");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, rowan, 2, { targets: [ref(B)] });
    // One that arrives before their declaration is bound too.
    const later = spawn(game, "Serra Angel", B);
    game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === B);
    const offer = game.legalActions(B).find((o): o is AttackOffer => o.kind === "declare-attackers");
    expect([...(offer?.mustAttack ?? [])].sort()).toEqual([bears, later].sort());
  });

  it("−2: 3 damage to each tapped creature target player controls", () => {
    const { game } = table();
    const rowan = spawn(game, "Rowan Kenrith");
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    loyalty(game, rowan, -2, { targets: [ref(B)] });
    expect(game.state.objects[tapped].zone).toBe("graveyard");
    expect(game.state.objects[untapped].zone).toBe("battlefield");
    expect(game.state.objects[mine].zone).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("−8: target player's emblem copies each ability they activate", () => {
    const { game } = table();
    const rowan = spawn(game, "Rowan Kenrith");
    loyalty(game, rowan, -8, { targets: [ref(A)], atLeast: 8 });
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    // The copy keeps its original's target (no new one chosen).
    activate(game, sorcerer, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});
